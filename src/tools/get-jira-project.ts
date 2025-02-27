import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JiraService } from '../services/jira';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-jira-project tool with the MCP server
 * @param server The MCP server instance
 * @param jiraService The Jira service instance
 */
export function registerGetJiraProjectTool(
  server: McpServer,
  jiraService: JiraService,
) {
  server.tool(
    'get-jira-project',
    {
      projectKey: z
        .string()
        .describe('The key of the Jira project to retrieve'),
    },
    async ({ projectKey }) => {
      try {
        const project = await jiraService.getProject(projectKey);
        return formatResponse(project);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
