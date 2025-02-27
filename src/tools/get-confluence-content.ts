import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceService } from '../services/confluence';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-confluence-content tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The Confluence service instance
 */
export function registerGetConfluenceContentTool(
  server: McpServer,
  confluenceService: ConfluenceService,
) {
  server.tool(
    'get_confluence_content',
    {
      contentId: z
        .string()
        .describe('The ID of the Confluence content to retrieve'),
    },
    async ({ contentId }) => {
      try {
        const content = await confluenceService.getContent(contentId);
        return formatResponse(content);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
