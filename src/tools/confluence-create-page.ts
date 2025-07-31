import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceV2Service } from '../services/confluencev2';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the confluence-create-page tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The ConfluenceV2 service instance
 */
export function registerConfluenceCreatePageTool(
  server: McpServer,
  confluenceService: ConfluenceV2Service,
) {
  server.tool(
    'confluence_create_page',
    {
      spaceId: z
        .string()
        .describe('The ID of the space where the page will be created'),
      title: z.string().describe('The title of the page'),
      content: z.string().describe('The content of the page in storage format'),
      status: z
        .enum(['current', 'draft'])
        .optional()
        .default('current')
        .describe('The status of the page (default: current)'),
      representation: z
        .enum(['storage', 'atlas_doc_format', 'wiki'])
        .optional()
        .default('storage')
        .describe('The content representation format (default: storage)'),
      parentId: z
        .string()
        .optional()
        .describe('The ID of the parent page (optional)'),
    },
    async ({
      spaceId,
      title,
      content,
      status = 'current',
      representation = 'storage',
      parentId,
    }) => {
      try {
        const result = await confluenceService.createPage({
          spaceId,
          title,
          status,
          body: {
            representation,
            value: content,
          },
          parentId,
        });
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
