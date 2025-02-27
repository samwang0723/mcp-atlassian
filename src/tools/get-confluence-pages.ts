import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceService } from '../services/confluence';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-confluence-pages tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The Confluence service instance
 */
export function registerGetConfluencePagesTool(
  server: McpServer,
  confluenceService: ConfluenceService,
) {
  server.tool(
    'get-confluence-pages',
    {
      spaceKey: z.string().describe('The key of the Confluence space'),
      limit: z
        .number()
        .optional()
        .describe('The maximum number of results to return (default: 100)'),
    },
    async ({ spaceKey, limit }) => {
      try {
        const pages = await confluenceService.getPagesInSpace(spaceKey, limit);
        return formatResponse(pages);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
