import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JiraService } from '../services/jira';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the search-jira-issues tool with the MCP server
 * @param server The MCP server instance
 * @param jiraService The Jira service instance
 */
export function registerSearchJiraIssuesTool(
  server: McpServer,
  jiraService: JiraService,
) {
  server.tool(
    'search_jira_issues',
    {
      jql: z.string().describe('The JQL query to search for issues'),
      maxResults: z
        .number()
        .optional()
        .describe('The maximum number of results to return (default: 50)'),
    },
    async ({ jql, maxResults }) => {
      try {
        // remove any new lines in the query
        const cleanedJql = jql.replace(/\n/g, '');
        const results = await jiraService.searchIssues(cleanedJql, maxResults);
        return formatResponse(results);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
