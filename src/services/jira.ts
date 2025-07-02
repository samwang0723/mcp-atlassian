import { JiraApi } from 'ts-jira-client';
import config from '@/config/env';

// Add Node.js types for process
declare global {
  interface Process {
    env: ProcessEnv;
  }
  interface ProcessEnv {
    NODE_TLS_REJECT_UNAUTHORIZED?: string;
  }
}

// Define interfaces for Jira issue types
interface JiraComment {
  body: string;
  created: string;
  author: {
    displayName?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface JiraIssueFields {
  summary?: string;
  description?: string;
  created: string;
  issuetype?: {
    name: string;
    [key: string]: unknown;
  };
  status?: {
    name: string;
    [key: string]: unknown;
  };
  comment?: {
    comments: JiraComment[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: JiraIssueFields;
  [key: string]: unknown;
}

interface StructuredJiraIssue {
  key: string;
  title: string;
  type: string;
  status: string;
  created: string;
  description: string;
  comments: {
    body: string;
    created: string;
    author: string;
  }[];
}

interface JiraSearchResult {
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}

interface StructuredJiraSearchResult {
  startAt: number;
  maxResults: number;
  total: number;
  issues: StructuredJiraIssue[];
}

/**
 * Jira service for interacting with the Jira API
 */
export class JiraService {
  private client: JiraApi;

  constructor() {
    // Use the dedicated Jira URL if available, otherwise derive from Atlassian host
    const jiraUrl = config.jira.url || config.atlassian.host;

    // Extract the hostname from the full URL
    const host = jiraUrl.replace(/^https?:\/\//, '');

    // Disable SSL verification globally for Node.js (bypass self-signed certificate issues)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    this.client = new JiraApi({
      protocol: 'https',
      host,
      username: config.atlassian.email,
      password: config.atlassian.apiToken,
      apiVersion: 2,
      strictSSL: false, // Force disable SSL verification
    });
  }

  /**
   * Clean text by removing HTML tags and normalizing whitespace
   * @param text The text to clean
   * @returns The cleaned text
   */
  private cleanText(text: string): string {
    if (!text) return '';
    // Remove HTML tags
    const withoutHtml = text.replace(/<[^>]*>/g, '');
    // Normalize whitespace
    return withoutHtml.replace(/\s+/g, ' ').trim();
  }

  /**
   * Parse date string to a formatted date
   * @param dateString The date string to parse
   * @returns The formatted date string
   */
  private parseDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      console.error('Error parsing date:', error);
      return dateString;
    }
  }

  /**
   * Get an issue by key with parsed and structured fields
   * @param issueKey The key of the issue to retrieve
   * @param expand Optional fields to expand in the response (comma-separated string)
   * @returns The structured issue object
   */
  async getIssue(
    issueKey: string,
    expand?: string,
  ): Promise<StructuredJiraIssue> {
    try {
      // The ts-jira-client findIssue method accepts issueKey as first parameter
      // and a string for expand parameter
      const issue = (await this.client.findIssue(
        issueKey,
        expand,
      )) as JiraIssue;

      // Extract fields
      const fields = issue.fields;

      // Process description
      const description = this.cleanText(fields.description || '');

      // Process comments
      const comments = [];
      if (fields.comment && fields.comment.comments) {
        for (const comment of fields.comment.comments) {
          comments.push({
            body: this.cleanText(comment.body),
            created: this.parseDate(comment.created),
            author: comment.author?.displayName || 'Unknown',
          });
        }
      }

      // Format created date
      const createdDate = this.parseDate(fields.created);

      // Create structured response
      const structuredIssue: StructuredJiraIssue = {
        key: issueKey,
        title: fields.summary || '',
        type: fields.issuetype?.name || '',
        status: fields.status?.name || '',
        created: createdDate,
        description,
        comments,
      };

      return structuredIssue;
    } catch (error) {
      console.error(`Error getting issue ${issueKey}:`, error);
      throw error;
    }
  }

  /**
   * Search for issues using JQL
   * @param jql The JQL query
   * @param maxResults The maximum number of results to return
   * @param startAt The index of the first result to return (0-based)
   * @param expand Optional fields to expand in the response (array of fields)
   * @returns The structured search results
   */
  async searchIssues(
    jql: string,
    maxResults = 20,
    startAt = 0,
    expand?: string[],
  ): Promise<StructuredJiraSearchResult> {
    try {
      // Build search options
      const searchOptions: {
        maxResults: number;
        startAt: number;
        expand?: string[];
      } = {
        maxResults,
        startAt,
      };

      // Add expand if provided
      if (expand && expand.length > 0) {
        searchOptions.expand = expand;
      }

      // Execute search
      const searchResult = (await this.client.searchJira(
        jql,
        searchOptions,
      )) as JiraSearchResult;

      // Process each issue in the results
      const structuredIssues: StructuredJiraIssue[] = searchResult.issues.map(
        (issue) => {
          const fields = issue.fields;

          // Process description
          const description = this.cleanText(fields.description || '');

          // Process comments
          const comments = [];
          if (fields.comment && fields.comment.comments) {
            for (const comment of fields.comment.comments) {
              comments.push({
                body: this.cleanText(comment.body),
                created: this.parseDate(comment.created),
                author: comment.author?.displayName || 'Unknown',
              });
            }
          }

          // Format created date
          const createdDate = this.parseDate(fields.created);

          // Create structured issue
          return {
            key: issue.key,
            title: fields.summary || '',
            type: fields.issuetype?.name || '',
            status: fields.status?.name || '',
            created: createdDate,
            description,
            comments,
          };
        },
      );

      // Return structured search result
      return {
        startAt: searchResult.startAt,
        maxResults: searchResult.maxResults,
        total: searchResult.total,
        issues: structuredIssues,
      };
    } catch (error) {
      console.error(`Error searching issues with query ${jql}:`, error);
      throw error;
    }
  }

  /**
   * Create a new issue
   * @param issueData The issue data to create
   * @returns The created issue
   */
  async createIssue(issueData: {
    project: string;
    summary: string;
    description?: string;
    issueType: string;
    priority?: string;
    assignee?: string;
    labels?: string[];
    components?: string[];
    [key: string]: unknown;
  }): Promise<unknown> {
    try {
      const issue = {
        fields: {
          project: { key: issueData.project },
          summary: issueData.summary,
          description: issueData.description || '',
          issuetype: { name: issueData.issueType },
          ...(issueData.priority && { priority: { name: issueData.priority } }),
          ...(issueData.assignee && { assignee: { name: issueData.assignee } }),
          ...(issueData.labels && { labels: issueData.labels }),
          ...(issueData.components && {
            components: issueData.components.map((c) => ({ name: c })),
          }),
        },
      };

      return await this.client.addNewIssue(issue);
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }

  /**
   * Update an existing issue
   * @param issueKey The key of the issue to update
   * @param updateData The data to update
   * @returns The updated issue
   */
  async updateIssue(
    issueKey: string,
    updateData: {
      summary?: string;
      description?: string;
      priority?: string;
      assignee?: string;
      labels?: string[];
      [key: string]: unknown;
    },
  ): Promise<void> {
    try {
      const update: { fields: Record<string, unknown> } = { fields: {} };

      if (updateData.summary) update.fields.summary = updateData.summary;
      if (updateData.description)
        update.fields.description = updateData.description;
      if (updateData.priority)
        update.fields.priority = { name: updateData.priority };
      if (updateData.assignee)
        update.fields.assignee = { name: updateData.assignee };
      if (updateData.labels) update.fields.labels = updateData.labels;

      await this.client.updateIssue(issueKey, update);
    } catch (error) {
      console.error(`Error updating issue ${issueKey}:`, error);
      throw error;
    }
  }

  /**
   * Delete an issue
   * @param issueKey The key of the issue to delete
   * @returns Success status
   */
  async deleteIssue(issueKey: string): Promise<void> {
    try {
      await this.client.deleteIssue(issueKey);
    } catch (error) {
      console.error(`Error deleting issue ${issueKey}:`, error);
      throw error;
    }
  }

  /**
   * Add a comment to an issue
   * @param issueKey The key of the issue
   * @param comment The comment text
   * @returns The added comment
   */
  async addComment(issueKey: string, comment: string): Promise<unknown> {
    try {
      return await this.client.addComment(issueKey, { body: comment });
    } catch (error) {
      console.error(`Error adding comment to issue ${issueKey}:`, error);
      throw error;
    }
  }

  /**
   * Get available transitions for an issue
   * @param issueKey The key of the issue
   * @returns Available transitions
   */
  async getTransitions(issueKey: string): Promise<unknown> {
    try {
      return await this.client.listTransitions(issueKey);
    } catch (error) {
      console.error(`Error getting transitions for issue ${issueKey}:`, error);
      throw error;
    }
  }

  /**
   * Transition an issue to a new status
   * @param issueKey The key of the issue
   * @param transitionId The ID of the transition
   * @param comment Optional comment for the transition
   * @returns The transition result
   */
  async transitionIssue(
    issueKey: string,
    transitionId: string,
    comment?: string,
  ): Promise<void> {
    try {
      const transition: {
        transition: { id: string };
        update?: { comment: Array<{ add: { body: string } }> };
      } = { transition: { id: transitionId } };
      if (comment) {
        transition.update = { comment: [{ add: { body: comment } }] };
      }
      await this.client.transitionIssue(issueKey, transition);
    } catch (error) {
      console.error(`Error transitioning issue ${issueKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all projects
   * @returns List of all projects
   */
  async getAllProjects(): Promise<unknown> {
    try {
      return await this.client.listProjects();
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }

  /**
   * Add work log to an issue
   * @param issueKey The key of the issue
   * @param timeSpent Time spent (e.g., "2h 30m")
   * @param comment Optional comment
   * @param started Optional start date
   * @returns The added work log
   */
  async addWorklog(
    issueKey: string,
    timeSpent: string,
    comment?: string,
    started?: string,
  ): Promise<unknown> {
    try {
      const worklog: { timeSpent: string; comment?: string; started?: string } =
        { timeSpent };
      if (comment) worklog.comment = comment;
      if (started) worklog.started = started;

      return await this.client.addWorklog(issueKey, worklog);
    } catch (error) {
      console.error(`Error adding worklog to issue ${issueKey}:`, error);
      throw error;
    }
  }

  // TODO: Implement getWorklog when API signature is clarified
  // async getWorklog(issueKey: string): Promise<any> { ... }
}
