import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceV2Service } from '../services/confluencev2';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the search-confluence-pages-by-title tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The ConfluenceV2 service instance
 */
export function registerSearchConfluencePagesByTitleTool(
  server: McpServer,
  confluenceService: ConfluenceV2Service,
) {
  server.tool(
    'search_confluence_pages_by_title',
    {
      title: z.string().optional().describe('Title to search for'),
      spaceId: z
        .string()
        .optional()
        .describe('Optional space ID to limit search'),
      limit: z
        .number()
        .optional()
        .default(25)
        .describe('Maximum number of results to return (default: 25)'),
      cursor: z.string().optional().describe('Cursor for pagination'),
    },
    async ({ title, spaceId, limit = 25, cursor }) => {
      try {
        const results = await confluenceService.searchPagesByTitle(
          title,
          spaceId,
          limit,
          cursor,
        );
        return formatResponse(results);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
