import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JiraService } from '../services/jira';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the jira-add-comment tool with the MCP server
 * @param server The MCP server instance
 * @param jiraService The Jira service instance
 */
export function registerJiraAddCommentTool(
  server: McpServer,
  jiraService: JiraService,
) {
  server.tool(
    'jira_add_comment',
    {
      issueKey: z
        .string()
        .describe('The key of the issue to add comment to (e.g., PROJECT-123)'),
      comment: z.string().describe('The comment text to add'),
    },
    async ({ issueKey, comment }) => {
      try {
        const result = await jiraService.addComment(issueKey, comment);
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
