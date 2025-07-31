import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceV2Service } from '../services/confluencev2';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the update-confluence-page-title tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The ConfluenceV2 service instance
 */
export function registerUpdateConfluencePageTitleTool(
  server: McpServer,
  confluenceService: ConfluenceV2Service,
) {
  server.tool(
    'update_confluence_page_title',
    {
      pageId: z.string().describe('The ID of the page to update'),
      title: z.string().describe('The new title for the page'),
      status: z
        .enum(['current', 'draft'])
        .optional()
        .default('current')
        .describe('The status of the page (default: current)'),
    },
    async ({ pageId, title, status = 'current' }) => {
      try {
        const result = await confluenceService.updatePageTitle(
          pageId,
          title,
          status,
        );
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
