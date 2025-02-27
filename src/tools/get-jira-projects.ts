import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JiraService } from '../services/jira';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-jira-projects tool with the MCP server
 * @param server The MCP server instance
 * @param jiraService The Jira service instance
 */
export function registerGetJiraProjectsTool(
  server: McpServer,
  jiraService: JiraService,
) {
  server.tool('get-jira-projects', {}, async () => {
    try {
      const projects = await jiraService.getProjects();
      return formatResponse(projects);
    } catch (err) {
      return formatErrorResponse(err);
    }
  });
}
