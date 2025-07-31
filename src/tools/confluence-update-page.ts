import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceV2Service } from '../services/confluencev2';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the confluence-update-page tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The ConfluenceV2 service instance
 */
export function registerConfluenceUpdatePageTool(
  server: McpServer,
  confluenceService: ConfluenceV2Service,
) {
  server.tool(
    'confluence_update_page',
    {
      pageId: z.string().describe('The ID of the page to update'),
      title: z.string().optional().describe('The new title of the page'),
      content: z.string().describe('The new content of the page'),
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
      version: z
        .number()
        .describe(
          'The current version number of the page (required for updates)',
        ),
      versionMessage: z
        .string()
        .optional()
        .describe('Optional message for the version update'),
    },
    async ({
      pageId,
      title,
      content,
      status = 'current',
      representation = 'storage',
      version,
      versionMessage,
    }) => {
      try {
        const result = await confluenceService.updatePage({
          id: pageId,
          title,
          status,
          body: {
            representation,
            value: content,
          },
          version: {
            number: version,
            message: versionMessage,
          },
        });
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
