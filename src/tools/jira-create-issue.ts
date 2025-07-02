import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JiraService } from '../services/jira';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the jira-create-issue tool with the MCP server
 * @param server The MCP server instance
 * @param jiraService The Jira service instance
 */
export function registerJiraCreateIssueTool(
  server: McpServer,
  jiraService: JiraService,
) {
  server.tool(
    'jira_create_issue',
    {
      project: z
        .string()
        .describe('The project key where the issue will be created'),
      summary: z.string().describe('The summary/title of the issue'),
      description: z
        .string()
        .optional()
        .describe('The description of the issue'),
      issueType: z
        .string()
        .describe('The type of issue (e.g., Bug, Task, Story)'),
      priority: z.string().optional().describe('The priority of the issue'),
      assignee: z.string().optional().describe('The username of the assignee'),
      labels: z
        .array(z.string())
        .optional()
        .describe('Array of labels to add to the issue'),
      components: z
        .array(z.string())
        .optional()
        .describe('Array of component names'),
    },
    async ({
      project,
      summary,
      description,
      issueType,
      priority,
      assignee,
      labels,
      components,
    }) => {
      try {
        const result = await jiraService.createIssue({
          project,
          summary,
          description,
          issueType,
          priority,
          assignee,
          labels,
          components,
        });
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
