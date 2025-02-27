import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JiraService } from '../services/jira';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-jira-issue tool with the MCP server
 * @param server The MCP server instance
 * @param jiraService The Jira service instance
 */
export function registerGetJiraIssueTool(
  server: McpServer,
  jiraService: JiraService,
) {
  server.tool(
    'get-jira-issue',
    {
      issueKey: z
        .string()
        .describe('The key of the Jira issue to retrieve (e.g., PROJECT-123)'),
    },
    async ({ issueKey }) => {
      try {
        const issue = await jiraService.getIssue(issueKey);
        return formatResponse(issue);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
