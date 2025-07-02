import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JiraService } from '../services/jira';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the jira-transition-issue tool with the MCP server
 * @param server The MCP server instance
 * @param jiraService The Jira service instance
 */
export function registerJiraTransitionIssueTool(
  server: McpServer,
  jiraService: JiraService,
) {
  server.tool(
    'jira_transition_issue',
    {
      issueKey: z
        .string()
        .describe('The key of the issue to transition (e.g., PROJECT-123)'),
      transitionId: z.string().describe('The ID of the transition to perform'),
      comment: z
        .string()
        .optional()
        .describe('Optional comment to add during transition'),
    },
    async ({ issueKey, transitionId, comment }) => {
      try {
        const result = await jiraService.transitionIssue(
          issueKey,
          transitionId,
          comment,
        );
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
