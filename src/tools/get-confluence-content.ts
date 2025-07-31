import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceV2Service } from '../services/confluencev2';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the get-confluence-content tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The ConfluenceV2 service instance
 */
export function registerGetConfluenceContentTool(
  server: McpServer,
  confluenceService: ConfluenceV2Service,
) {
  server.tool(
    'get_confluence_content',
    {
      pageId: z.string().describe('The ID of the Confluence page to retrieve'),
      bodyFormat: z
        .enum(['storage', 'atlas_doc_format', 'wiki'])
        .optional()
        .default('storage')
        .describe('The format for the body content (default: storage)'),
    },
    async ({ pageId, bodyFormat = 'storage' }) => {
      try {
        const content = await confluenceService.getPage(pageId, bodyFormat);
        return formatResponse(content, true);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
