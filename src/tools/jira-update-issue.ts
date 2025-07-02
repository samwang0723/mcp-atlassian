import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JiraService } from '../services/jira';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the jira-update-issue tool with the MCP server
 * @param server The MCP server instance
 * @param jiraService The Jira service instance
 */
export function registerJiraUpdateIssueTool(
  server: McpServer,
  jiraService: JiraService,
) {
  server.tool(
    'jira_update_issue',
    {
      issueKey: z
        .string()
        .describe('The key of the issue to update (e.g., PROJECT-123)'),
      summary: z
        .string()
        .optional()
        .describe('The new summary/title of the issue'),
      description: z
        .string()
        .optional()
        .describe('The new description of the issue'),
      priority: z.string().optional().describe('The new priority of the issue'),
      assignee: z.string().optional().describe('The new assignee username'),
      labels: z
        .array(z.string())
        .optional()
        .describe('Array of labels to set on the issue'),
    },
    async ({ issueKey, summary, description, priority, assignee, labels }) => {
      try {
        const result = await jiraService.updateIssue(issueKey, {
          summary,
          description,
          priority,
          assignee,
          labels,
        });
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
