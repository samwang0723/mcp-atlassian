import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceService } from '../services/confluence';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the confluence-delete-page tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The Confluence service instance
 */
export function registerConfluenceDeletePageTool(
  server: McpServer,
  confluenceService: ConfluenceService,
) {
  server.tool(
    'confluence_delete_page',
    {
      pageId: z.string().describe('The ID of the page to delete'),
    },
    async ({ pageId }) => {
      try {
        const result = await confluenceService.deletePage(pageId);
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
