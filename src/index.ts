/**
 * Main entry point for the application
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { ConfluenceService } from './services/confluence';
import { JiraService } from './services/jira';
import {
  registerSearchConfluenceTool,
  registerGetConfluenceSpaceTool,
  registerGetConfluenceContentTool,
  registerGetConfluencePagesTool,
  registerSearchJiraIssuesTool,
  registerGetJiraIssueTool,
} from './tools';

// Create an MCP server
const server = new McpServer({
  name: 'mcp-atlassian',
  version: '1.0.0',
});

// Initialize services
const confluenceService = new ConfluenceService();
const jiraService = new JiraService();

// Register Confluence tools
registerSearchConfluenceTool(server, confluenceService);
registerGetConfluenceSpaceTool(server, confluenceService);
registerGetConfluenceContentTool(server, confluenceService);
registerGetConfluencePagesTool(server, confluenceService);

// Register Jira tools
registerSearchJiraIssuesTool(server, jiraService);
registerGetJiraIssueTool(server, jiraService);

// Start receiving messages on stdin and sending messages on stdout
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(console.error);

process.stdin.on('close', () => {
  console.error('Sumologic MCP Server closed');
  server.close();
});
