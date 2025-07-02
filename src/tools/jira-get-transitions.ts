import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JiraService } from '../services/jira';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the jira-get-transitions tool with the MCP server
 * @param server The MCP server instance
 * @param jiraService The Jira service instance
 */
export function registerJiraGetTransitionsTool(
  server: McpServer,
  jiraService: JiraService,
) {
  server.tool(
    'jira_get_transitions',
    {
      issueKey: z
        .string()
        .describe(
          'The key of the issue to get transitions for (e.g., PROJECT-123)',
        ),
    },
    async ({ issueKey }) => {
      try {
        const result = await jiraService.getTransitions(issueKey);
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
