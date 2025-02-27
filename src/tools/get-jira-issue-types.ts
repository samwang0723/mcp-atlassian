import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JiraService } from '../services/jira';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-jira-issue-types tool with the MCP server
 * @param server The MCP server instance
 * @param jiraService The Jira service instance
 */
export function registerGetJiraIssueTypesTool(
  server: McpServer,
  jiraService: JiraService,
) {
  server.tool('get-jira-issue-types', {}, async () => {
    try {
      const issueTypes = await jiraService.getIssueTypes();
      return formatResponse(issueTypes);
    } catch (err) {
      return formatErrorResponse(err);
    }
  });
}
