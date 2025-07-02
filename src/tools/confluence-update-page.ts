import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceService } from '../services/confluence';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the confluence-update-page tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The Confluence service instance
 */
export function registerConfluenceUpdatePageTool(
  server: McpServer,
  confluenceService: ConfluenceService,
) {
  server.tool(
    'confluence_update_page',
    {
      pageId: z.string().describe('The ID of the page to update'),
      title: z.string().optional().describe('The new title of the page'),
      content: z
        .string()
        .optional()
        .describe('The new content of the page in Confluence storage format'),
      version: z
        .number()
        .describe(
          'The current version number of the page (required for updates)',
        ),
    },
    async ({ pageId, title, content, version }) => {
      try {
        const result = await confluenceService.updatePage(pageId, {
          title,
          content,
          version,
        });
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
