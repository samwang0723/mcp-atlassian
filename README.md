# MCP Atlassian

A Model Context Protocol (MCP) server that provides comprehensive tools for interacting with Atlassian products (Confluence and Jira).

## Overview

This MCP server allows AI agents to interact with Atlassian products through a standardized interface. It provides extensive tools for:

- **Confluence**: Full CRUD operations, content search, space management, page management, comments, labels, and more using v2 REST API
- **Jira**: Issue management, project operations, transitions, comments, and comprehensive workflow support

## Key Features

- **Modern API Support**: Uses Confluence v2 REST API with fallback to v1 for search functionality
- **Comprehensive Toolset**: 18+ Confluence tools and 8+ Jira tools covering all major operations
- **Security & Privacy**: Built-in PII filtering and SSL verification controls
- **Flexible Configuration**: Support for separate service URLs, authentication methods, and tool filtering
- **Pagination Support**: Cursor-based pagination for v2 APIs and offset/limit for v1 APIs
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Type Safety**: Full TypeScript implementation with proper type definitions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Atlassian account with API token
- Docker (optional, for containerized deployment)

## Installation

### Standard Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/mcp-atlassian.git
   cd mcp-atlassian
   ```

2. Install dependencies:

   ```bash
   npm install
   # or using make
   make install
   ```

3. Create a `.env` file in the root directory with your Atlassian credentials:
   ```
   ATLASSIAN_HOST=https://your-domain.atlassian.net
   ATLASSIAN_EMAIL=your-email@example.com
   ATLASSIAN_API_TOKEN=your-api-token
   
   # Optional: Use separate URLs for Confluence/Jira
   CONFLUENCE_URL=https://your-domain.atlassian.net/wiki
   JIRA_URL=https://your-domain.atlassian.net
   
   # Optional: SSL verification (default: true)
   CONFLUENCE_SSL_VERIFY=false
   JIRA_SSL_VERIFY=false
   
   # Optional: Tool filtering
   READ_ONLY_MODE=false
   ENABLED_TOOLS=search_confluence,get_confluence_space,confluence_create_page
   ```

### Docker Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/mcp-atlassian.git
   cd mcp-atlassian
   ```

2. Create a `.env` file as described above.

3. Build and run the Docker container:

   ```bash
   # Build the Docker image
   make docker-build

   # Run the Docker container
   make docker-run

   # Or use Docker Compose
   make docker-compose
   ```

## Usage

### Starting the Server

```bash
# Using npm
npm start

# Using make
make start

# Using Docker
make docker-run
```

This will start the MCP server, which will listen for requests on stdin and respond on stdout.

### Available Tools

#### Confluence Tools

**Search & Discovery:**
- **search_confluence**: Search for content in Confluence using v1 API with CQL
  - Parameters: `searchText` (string), `spaceKey` (string, optional), `limit` (number), `start` (number)

- **search_confluence_pages_by_title**: Search pages by title using v2 API
  - Parameters: `title` (string, optional), `spaceId` (string, optional), `limit` (number), `cursor` (string, optional)

**Space Management:**
- **get_confluence_space_by_id_or_key**: Get information about a specific Confluence space
  - Parameters: `spaceIdOrKey` (string)

- **get_confluence_spaces**: Get all available spaces
  - Parameters: `limit` (number, optional), `cursor` (string, optional)

**Page Management:**
- **get_confluence_content**: Get specific page content by ID
  - Parameters: `pageId` (string), `bodyFormat` (enum: storage/atlas_doc_format/wiki, optional)

- **get_confluence_pages**: Get all pages in a space
  - Parameters: `spaceId` (string), `limit` (number, optional), `cursor` (string, optional)

- **get_confluence_child_pages**: Get child pages of a specific page
  - Parameters: `pageId` (string), `limit` (number, optional), `cursor` (string, optional)

- **confluence_create_page**: Create a new Confluence page
  - Parameters: `spaceId` (string), `title` (string), `content` (string), `status` (enum, optional), `representation` (enum, optional), `parentId` (string, optional)

- **confluence_update_page**: Update an existing page
  - Parameters: `pageId` (string), `title` (string), `content` (string), `version` (number), `status` (enum, optional), `representation` (enum, optional), `versionMessage` (string, optional)

- **update_confluence_page_title**: Update only the title of a page
  - Parameters: `pageId` (string), `title` (string), `status` (enum, optional)

- **confluence_delete_page**: Delete a Confluence page
  - Parameters: `pageId` (string)

**Label Management:**
- **get_confluence_pages_by_label**: Find pages with specific labels
  - Parameters: `label` (string), `spaceId` (string, optional), `limit` (number, optional), `cursor` (string, optional)

- **get_confluence_page_labels**: Get labels for a specific page
  - Parameters: `pageId` (string), `limit` (number, optional), `cursor` (string, optional)

- **add_confluence_page_labels**: Add labels to a page
  - Parameters: `pageId` (string), `labels` (array of strings)

**Comments:**
- **get_confluence_page_comments**: Get regular comments on a page
  - Parameters: `pageId` (string), `limit` (number, optional), `cursor` (string, optional)

- **add_confluence_page_comment**: Add a comment to a page
  - Parameters: `pageId` (string), `content` (string), `representation` (enum, optional)

- **get_confluence_page_inline_comments**: Get inline comments on a page
  - Parameters: `pageId` (string), `limit` (number, optional), `cursor` (string, optional)

- **create_confluence_footer_comment**: Create a footer comment
  - Parameters: `pageId` (string, optional), `blogPostId` (string, optional), `parentCommentId` (string, optional), `attachmentId` (string, optional), `customContentId` (string, optional), `content` (string), `representation` (enum, optional)

#### Jira Tools

- **search_jira_issues**: Search for issues using JQL (Jira Query Language)
  - Parameters: `jql` (string), `maxResults` (number, optional)

- **get_jira_issue**: Get detailed information about a specific issue
  - Parameters: `issueKey` (string)

- **jira_get_all_projects**: Get all accessible projects
  - Parameters: none

- **jira_create_issue**: Create a new Jira issue
  - Parameters: `projectKey` (string), `issueType` (string), `summary` (string), `description` (string, optional), additional fields

- **jira_update_issue**: Update an existing issue
  - Parameters: `issueKey` (string), `fields` (object with update data)

- **jira_add_comment**: Add a comment to an issue
  - Parameters: `issueKey` (string), `comment` (string)

- **jira_get_transitions**: Get available transitions for an issue
  - Parameters: `issueKey` (string)

- **jira_transition_issue**: Transition an issue to a different status
  - Parameters: `issueKey` (string), `transitionId` (string), `comment` (string, optional)

## Architecture Notes

### Confluence API Migration

This server primarily uses the **Confluence v2 REST API** for most operations, with strategic fallback to v1 API where necessary:

- **v2 API**: Used for spaces, pages, comments, labels - provides better performance and modern cursor-based pagination
- **v1 API**: Used for content search via CQL - provides more powerful search capabilities
- **SSL Support**: Configurable SSL verification bypass for self-hosted instances
- **Authentication**: Supports basic auth, OAuth 2.0 (planned), and PAT tokens

### Tool Filtering & Security

- **Read-Only Mode**: Disable all write operations for safe exploration
- **Tool Whitelist**: Enable only specific tools via `ENABLED_TOOLS` environment variable
- **PII Filtering**: Automatic detection and masking of sensitive information in responses
- **Error Context**: Detailed error messages without exposing sensitive configuration

## Development

### Project Structure

```
src/
├── config/         # Configuration files
│   └── env.ts      # Environment configuration with validation
├── services/       # Service classes for Atlassian APIs
│   ├── confluencev2.ts    # Confluence v2 REST API service (primary)
│   ├── confluence.ts      # Legacy Confluence service (deprecated)
│   └── jira.ts           # Jira REST API service
├── tools/          # MCP tool implementations
│   ├── search-confluence.ts                    # Content search (v1 API)
│   ├── search-confluence-pages-by-title.ts     # Title search (v2 API)
│   ├── get-confluence-space.ts                 # Single space info
│   ├── get-confluence-spaces.ts                # All spaces list
│   ├── get-confluence-content.ts               # Page content by ID
│   ├── get-confluence-pages.ts                 # Pages in space
│   ├── get-confluence-child-pages.ts           # Child pages
│   ├── get-confluence-pages-by-label.ts        # Pages by label
│   ├── get-confluence-page-labels.ts           # Page labels
│   ├── add-confluence-page-labels.ts           # Add labels
│   ├── get-confluence-page-comments.ts         # Page comments
│   ├── add-confluence-page-comment.ts          # Add comment
│   ├── get-confluence-page-inline-comments.ts  # Inline comments
│   ├── confluence-create-page.ts               # Create page
│   ├── confluence-update-page.ts               # Update page
│   ├── update-confluence-page-title.ts         # Update title only
│   ├── confluence-delete-page.ts               # Delete page
│   ├── create-confluence-footer-comment.ts     # Footer comments
│   ├── search-jira-issues.ts                   # Jira search
│   ├── get-jira-issue.ts                       # Single issue
│   ├── jira-create-issue.ts                    # Create issue
│   ├── jira-update-issue.ts                    # Update issue
│   ├── jira-add-comment.ts                     # Add comment
│   ├── jira-get-transitions.ts                 # Get transitions
│   ├── jira-transition-issue.ts                # Transition issue
│   ├── jira-get-all-projects.ts                # All projects
│   ├── utils.ts                                 # Utility functions & PII filtering
│   └── index.ts                                # Tool exports
├── utils/          # Utility modules
│   └── tool-filter.ts      # Tool filtering and access control
└── index.ts        # Main entry point and server setup
```

### Building

```bash
# Using npm
npm run build

# Using make
make build
```

### Testing

```bash
# Using npm
npm test

# Using make
make test
```

### Makefile Commands

The project includes a Makefile to simplify common operations:

```bash
# Display available commands
make help
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
