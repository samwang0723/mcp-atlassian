import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceService } from '../services/confluence';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the search-confluence tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The Confluence service instance
 */
export function registerSearchConfluenceTool(
  server: McpServer,
  confluenceService: ConfluenceService,
) {
  server.tool(
    'search_confluence',
    {
      query: z
        .string()
        .describe(
          'The Confluence Query Language (CQL) query to search for content',
        ),
    },
    async ({ query }) => {
      try {
        // remove any new lines in the query
        const cleanedQuery = query.replace(/\n/g, '');
        const results = await confluenceService.searchContent(cleanedQuery);
        return formatResponse(results);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
