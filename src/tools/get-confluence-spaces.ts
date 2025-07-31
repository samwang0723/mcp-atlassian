import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceV2Service } from '../services/confluencev2';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-confluence-spaces tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The ConfluenceV2 service instance
 */
export function registerGetConfluenceSpacesTool(
  server: McpServer,
  confluenceService: ConfluenceV2Service,
) {
  server.tool(
    'get_confluence_spaces',
    {
      limit: z
        .number()
        .optional()
        .default(25)
        .describe('Maximum number of results to return (default: 25)'),
      cursor: z.string().optional().describe('Cursor for pagination'),
    },
    async ({ limit = 25, cursor }) => {
      try {
        const results = await confluenceService.getSpaces(limit, cursor);
        return formatResponse(results);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
