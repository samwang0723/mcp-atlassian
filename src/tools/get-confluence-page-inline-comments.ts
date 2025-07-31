import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceV2Service } from '../services/confluencev2';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-confluence-page-inline-comments tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The ConfluenceV2 service instance
 */
export function registerGetConfluencePageInlineCommentsTool(
  server: McpServer,
  confluenceService: ConfluenceV2Service,
) {
  server.tool(
    'get_confluence_page_inline_comments',
    {
      pageId: z.string().describe('The ID of the page'),
      limit: z
        .number()
        .optional()
        .default(25)
        .describe('Maximum number of results to return (default: 25)'),
      cursor: z.string().optional().describe('Cursor for pagination'),
    },
    async ({ pageId, limit = 25, cursor }) => {
      try {
        const results = await confluenceService.getPageInlineComments(
          pageId,
          limit,
          cursor,
        );
        return formatResponse(results, true);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
