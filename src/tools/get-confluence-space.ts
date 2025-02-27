import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceService } from '../services/confluence';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-confluence-space tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The Confluence service instance
 */
export function registerGetConfluenceSpaceTool(
  server: McpServer,
  confluenceService: ConfluenceService,
) {
  server.tool(
    'get_confluence_space',
    {
      spaceKey: z
        .string()
        .describe('The key of the Confluence space to retrieve'),
    },
    async ({ spaceKey }) => {
      try {
        const space = await confluenceService.getSpace(spaceKey);
        return formatResponse(space);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
