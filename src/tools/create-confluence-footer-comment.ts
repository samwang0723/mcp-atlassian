import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ConfluenceV2Service } from '../services/confluencev2';
import { formatResponse, formatErrorResponse } from './utils';

/**
 * Register the create-confluence-footer-comment tool with the MCP server
 * @param server The MCP server instance
 * @param confluenceService The ConfluenceV2 service instance
 */
export function registerCreateConfluenceFooterCommentTool(
  server: McpServer,
  confluenceService: ConfluenceV2Service,
) {
  server.tool(
    'create_confluence_footer_comment',
    {
      pageId: z
        .string()
        .optional()
        .describe('The ID of the page to comment on'),
      blogPostId: z
        .string()
        .optional()
        .describe('The ID of the blog post to comment on'),
      parentCommentId: z
        .string()
        .optional()
        .describe('The ID of the parent comment (for replies)'),
      attachmentId: z
        .string()
        .optional()
        .describe('The ID of the attachment to comment on'),
      customContentId: z
        .string()
        .optional()
        .describe('The ID of the custom content to comment on'),
      content: z.string().describe('The content of the comment'),
      representation: z
        .enum(['storage', 'atlas_doc_format', 'wiki'])
        .optional()
        .default('storage')
        .describe('The content representation format (default: storage)'),
    },
    async ({
      pageId,
      blogPostId,
      parentCommentId,
      attachmentId,
      customContentId,
      content,
      representation = 'storage',
    }) => {
      try {
        const result = await confluenceService.createFooterComment({
          pageId,
          blogPostId,
          parentCommentId,
          attachmentId,
          customContentId,
          body: {
            representation,
            value: content,
          },
        });
        return formatResponse(result);
      } catch (err) {
        return formatErrorResponse(err);
      }
    },
  );
}
