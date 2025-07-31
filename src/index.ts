#!/usr/bin/env node
/**
 * Main entry point for the application
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { ConfluenceV2Service } from './services/confluencev2';
import { JiraService } from './services/jira';
import { isToolEnabled, logEnabledTools } from './utils/tool-filter';
import {
  // Confluence tools
  registerSearchConfluenceTool,
  registerSearchConfluencePagesByTitleTool,
  registerGetConfluenceSpaceTool,
  registerGetConfluenceSpacesTool,
  registerGetConfluenceContentTool,
  registerGetConfluencePagesTool,
  registerGetConfluencePagesByLabelTool,
  registerGetConfluencePageInlineCommentsTool,
  registerConfluenceCreatePageTool,
  registerConfluenceUpdatePageTool,
  registerUpdateConfluencePageTitleTool,
  registerCreateConfluenceFooterCommentTool,
  // Jira tools
  registerSearchJiraIssuesTool,
  registerGetJiraIssueTool,
  registerJiraCreateIssueTool,
  registerJiraUpdateIssueTool,
  registerJiraAddCommentTool,
  registerJiraTransitionIssueTool,
  registerJiraGetTransitionsTool,
  registerJiraGetAllProjectsTool,
} from './tools';

// Load environment variables
dotenv.config();

// Add this line to disable SSL certificate verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class McpAtlassianServer {
  private confluenceService: ConfluenceV2Service;
  private jiraService: JiraService;

  constructor() {
    this.confluenceService = new ConfluenceV2Service();
    this.jiraService = new JiraService();

    // Log enabled tools for debugging
    logEnabledTools();
  }

  private createServer(): McpServer {
    // Create an MCP server
    const server = new McpServer({
      name: 'mcp-atlassian',
      version: '1.0.0',
    });

    // Register Confluence tools (conditionally)
    if (isToolEnabled('search_confluence')) {
      registerSearchConfluenceTool(server, this.confluenceService);
    }
    if (isToolEnabled('search_confluence_pages_by_title')) {
      registerSearchConfluencePagesByTitleTool(server, this.confluenceService);
    }
    if (isToolEnabled('get_confluence_space_by_id_or_key')) {
      registerGetConfluenceSpaceTool(server, this.confluenceService);
    }
    if (isToolEnabled('get_confluence_spaces')) {
      registerGetConfluenceSpacesTool(server, this.confluenceService);
    }
    if (isToolEnabled('get_confluence_content')) {
      registerGetConfluenceContentTool(server, this.confluenceService);
    }
    if (isToolEnabled('get_confluence_pages')) {
      registerGetConfluencePagesTool(server, this.confluenceService);
    }
    if (isToolEnabled('get_confluence_pages_by_label')) {
      registerGetConfluencePagesByLabelTool(server, this.confluenceService);
    }
    if (isToolEnabled('get_confluence_page_inline_comments')) {
      registerGetConfluencePageInlineCommentsTool(
        server,
        this.confluenceService,
      );
    }
    if (isToolEnabled('confluence_create_page')) {
      registerConfluenceCreatePageTool(server, this.confluenceService);
    }
    if (isToolEnabled('confluence_update_page')) {
      registerConfluenceUpdatePageTool(server, this.confluenceService);
    }
    if (isToolEnabled('update_confluence_page_title')) {
      registerUpdateConfluencePageTitleTool(server, this.confluenceService);
    }
    if (isToolEnabled('create_confluence_footer_comment')) {
      registerCreateConfluenceFooterCommentTool(server, this.confluenceService);
    }

    // Register Jira tools (conditionally)
    if (isToolEnabled('search_jira_issues')) {
      registerSearchJiraIssuesTool(server, this.jiraService);
    }
    if (isToolEnabled('get_jira_issue')) {
      registerGetJiraIssueTool(server, this.jiraService);
    }
    if (isToolEnabled('jira_create_issue')) {
      registerJiraCreateIssueTool(server, this.jiraService);
    }
    if (isToolEnabled('jira_update_issue')) {
      registerJiraUpdateIssueTool(server, this.jiraService);
    }
    if (isToolEnabled('jira_add_comment')) {
      registerJiraAddCommentTool(server, this.jiraService);
    }
    if (isToolEnabled('jira_transition_issue')) {
      registerJiraTransitionIssueTool(server, this.jiraService);
    }
    if (isToolEnabled('jira_get_transitions')) {
      registerJiraGetTransitionsTool(server, this.jiraService);
    }
    if (isToolEnabled('jira_get_all_projects')) {
      registerJiraGetAllProjectsTool(server, this.jiraService);
    }

    return server;
  }

  async run() {
    const app = express();
    app.use(express.json());

    // Map to store transports by session ID for stateful connections
    const transports: { [sessionId: string]: StreamableHTTPServerTransport } =
      {};

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'mcp-atlassian',
        version: '1.0.0',
        enabled_tools: {
          confluence: [
            'search_confluence',
            'search_confluence_pages_by_title',
            'get_confluence_space_by_id_or_key',
            'get_confluence_spaces',
            'get_confluence_content',
            'get_confluence_pages',
            'get_confluence_pages_by_label',
            'get_confluence_page_inline_comments',
            'confluence_create_page',
            'confluence_update_page',
            'update_confluence_page_title',
            'create_confluence_footer_comment',
          ].filter((tool) => isToolEnabled(tool)),
          jira: [
            'search_jira_issues',
            'get_jira_issue',
            'jira_create_issue',
            'jira_update_issue',
            'jira_add_comment',
            'jira_transition_issue',
            'jira_get_transitions',
            'jira_get_all_projects',
          ].filter((tool) => isToolEnabled(tool)),
        },
      });
    });

    // Handle POST requests for client-to-server communication
    app.post('/mcp', async (req, res) => {
      try {
        // Check for existing session ID
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport: StreamableHTTPServerTransport;
        let server: McpServer;

        if (sessionId && transports[sessionId]) {
          // Reuse existing transport
          transport = transports[sessionId];
        } else if (!sessionId && isInitializeRequest(req.body)) {
          // New initialization request
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
              // Store the transport by session ID
              transports[sessionId] = transport;
              console.log(`New MCP session initialized: ${sessionId}`);
            },
          });

          // Clean up transport when closed
          transport.onclose = () => {
            if (transport.sessionId) {
              console.log(`MCP session closed: ${transport.sessionId}`);
              delete transports[transport.sessionId];
            }
          };

          // Create new server instance
          server = this.createServer();

          // Connect to the MCP server
          await server.connect(transport);
        } else {
          // Invalid request
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided',
            },
            id: null,
          });
          return;
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal server error',
            },
            id: null,
          });
        }
      }
    });

    // Reusable handler for GET and DELETE requests
    const handleSessionRequest = async (
      req: express.Request,
      res: express.Response,
    ) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }

      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    };

    // Handle GET requests for server-to-client notifications via SSE
    app.get('/mcp', handleSessionRequest);

    // Handle DELETE requests for session termination
    app.delete('/mcp', handleSessionRequest);

    // Get port from environment or default to 3000
    const port = parseInt(process.env.PORT || '3000', 10);

    // Start the server
    app.listen(port, '0.0.0.0', () => {
      console.log(`MCP Atlassian Server running on http://0.0.0.0:${port}`);
      console.log(`Health check available at http://0.0.0.0:${port}/health`);
      console.log(`MCP endpoint available at http://0.0.0.0:${port}/mcp`);
    });
  }
}

// Start the server
const server = new McpAtlassianServer();
server.run().catch((error) => {
  console.error('Failed to start Atlassian MCP server:', error);
  process.exit(1);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Atlassian MCP server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down Atlassian MCP server...');
  process.exit(0);
});
