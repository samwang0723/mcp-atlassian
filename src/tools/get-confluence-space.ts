import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceV2Service } from '../services/confluencev2';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-confluence-space tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The ConfluenceV2 service instance
 */
export function registerGetConfluenceSpaceTool(
  server: McpServer,
  confluenceService: ConfluenceV2Service,
) {
  server.tool(
    'get_confluence_space_by_id_or_key',
    {
      spaceIdOrKey: z
        .string()
        .describe('The ID or key of the Confluence space to retrieve'),
    },
    async ({ spaceIdOrKey }) => {
      try {
        const space = await confluenceService.getSpace(spaceIdOrKey);
        return formatResponse(space);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
