import { JiraApi } from 'ts-jira-client';
import config from '@/config/env';

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
   * Get an issue by key
   * @param issueKey The key of the issue to retrieve
   * @returns The issue object
   */
  async getIssue(issueKey: string) {
    try {
      return await this.client.findIssue(issueKey);
    } catch (error) {
      console.error(`Error getting issue ${issueKey}:`, error);
      throw error;
    }
  }

  /**
   * Search for issues using JQL
   * @param jql The JQL query
   * @param maxResults The maximum number of results to return
   * @returns The search results
   */
  async searchIssues(jql: string, maxResults = 50) {
    try {
      return await this.client.searchJira(jql, { maxResults });
    } catch (error) {
      console.error(`Error searching issues with query ${jql}:`, error);
      throw error;
    }
  }

  /**
   * Get all projects
   * @returns List of projects
   */
  async getProjects() {
    try {
      return await this.client.listProjects();
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  /**
   * Get a project by key
   * @param projectKey The key of the project to retrieve
   * @returns The project object
   */
  async getProject(projectKey: string) {
    try {
      return await this.client.getProject(projectKey);
    } catch (error) {
      console.error(`Error getting project ${projectKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all issue types
   * @returns List of issue types
   */
  async getIssueTypes() {
    try {
      return await this.client.listIssueTypes();
    } catch (error) {
      console.error('Error getting issue types:', error);
      throw error;
    }
  }
}
