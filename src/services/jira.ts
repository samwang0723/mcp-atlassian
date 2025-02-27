import { JiraApi } from 'ts-jira-client';
import config from '@/config/env';

// Define interfaces for Jira issue types
interface JiraComment {
  body: string;
  created: string;
  author: {
    displayName?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface JiraIssueFields {
  summary?: string;
  description?: string;
  created: string;
  issuetype?: {
    name: string;
    [key: string]: any;
  };
  status?: {
    name: string;
    [key: string]: any;
  };
  comment?: {
    comments: JiraComment[];
    [key: string]: any;
  };
  [key: string]: any;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: JiraIssueFields;
  [key: string]: any;
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
    // Extract the hostname from the full URL
    const host = config.atlassian.host.replace(/^https?:\/\//, '');

    this.client = new JiraApi({
      protocol: 'https',
      host,
      username: config.atlassian.email,
      password: config.atlassian.apiToken,
      apiVersion: 2,
      strictSSL: true,
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
}
