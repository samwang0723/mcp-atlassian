import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceService } from '../services/confluence';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the confluence-create-page tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The Confluence service instance
 */
export function registerConfluenceCreatePageTool(
  server: McpServer,
  confluenceService: ConfluenceService,
) {
  server.tool(
    'confluence_create_page',
    {
      spaceKey: z
        .string()
        .describe('The key of the space where the page will be created'),
      title: z.string().describe('The title of the page'),
      content: z
        .string()
        .describe('The content of the page in Confluence storage format'),
      parentId: z
        .string()
        .optional()
        .describe('The ID of the parent page (optional)'),
    },
    async ({ spaceKey, title, content, parentId }) => {
      try {
        const result = await confluenceService.createPage({
          spaceKey,
          title,
          content,
          parentId,
        });
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
