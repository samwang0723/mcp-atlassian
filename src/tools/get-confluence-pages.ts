import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceV2Service } from '../services/confluencev2';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-confluence-pages tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The ConfluenceV2 service instance
 */
export function registerGetConfluencePagesTool(
  server: McpServer,
  confluenceService: ConfluenceV2Service,
) {
  server.tool(
    'get_confluence_pages',
    {
      spaceId: z.string().describe('The ID of the Confluence space'),
      limit: z
        .number()
        .optional()
        .default(25)
        .describe('The maximum number of results to return (default: 25)'),
      cursor: z.string().optional().describe('Cursor for pagination'),
    },
    async ({ spaceId, limit = 25, cursor }) => {
      try {
        const pages = await confluenceService.getPagesInSpace(
          spaceId,
          limit,
          cursor,
        );
        return formatResponse(pages);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
