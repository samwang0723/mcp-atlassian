# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Development
- `npm run build` - Compile TypeScript to JavaScript in dist/
- `npm run dev` - Run in development mode with ts-node
- `npm start` - Run the production build from dist/

### Code Quality
- `npm run lint` - Run ESLint on TypeScript files
- `npm run format` - Format code with Prettier

### Testing
- No test suite is currently configured (package.json shows placeholder test command)

## Architecture Overview

This is an MCP (Model Context Protocol) server that provides integrations with Atlassian tools (Jira and Confluence). The codebase follows a modular service-oriented architecture:

### Core Structure
- **`src/index.ts`** - Main entry point that initializes the MCP server and conditionally registers tools based on configuration
- **`src/services/`** - Core API service classes for Jira and Confluence that wrap the underlying client libraries
- **`src/tools/`** - Individual MCP tool implementations, each exported as a registration function
- **`src/config/env.ts`** - Centralized environment configuration with validation
- **`src/utils/tool-filter.ts`** - Tool filtering logic for read-only mode and selective tool enabling

### Key Architecture Patterns

#### Service Layer
The `JiraService` and `ConfluenceService` classes encapsulate API interactions:
- JiraService uses `ts-jira-client` library
- ConfluenceService uses `confluence.js` library
- Both support multiple authentication methods (basic auth, OAuth, PAT)
- SSL verification is configurable per service

#### Tool Registration Pattern
Tools are implemented as individual modules that export registration functions:
- Each tool registers itself with the MCP server instance
- Tool availability is controlled by configuration (enabled tools list, read-only mode)
- Tools are categorized as READ_TOOLS or WRITE_TOOLS for access control

#### Configuration System
Environment-based configuration with:
- Support for separate Jira/Confluence URLs or unified Atlassian host
- Multiple authentication methods with automatic fallbacks
- Tool filtering and read-only mode capabilities
- SSL verification controls per service

### Tool Categories
- **Confluence Read**: search_confluence, get_confluence_space, get_confluence_content, get_confluence_pages
- **Confluence Write**: confluence_create_page, confluence_update_page, confluence_delete_page
- **Jira Read**: search_jira_issues, get_jira_issue, jira_get_transitions, jira_get_all_projects
- **Jira Write**: jira_create_issue, jira_update_issue, jira_add_comment, jira_transition_issue

## Development Notes

### Path Resolution
- Uses TypeScript path mapping with `@/` aliasing to `src/`
- Requires `tsconfig-paths/register` and custom `paths.js` for runtime resolution

### Security Considerations
- SSL certificate verification is disabled globally in index.ts (line 31)
- Individual services can override SSL settings via environment variables
- Sensitive credentials are loaded from environment variables only

### Authentication Flow
The system supports three authentication methods with automatic detection:
1. **Basic Auth** (default) - email + API token for Cloud, username + token for Server
2. **OAuth 2.0** - Client credentials flow (configuration ready but not fully implemented)
3. **PAT** - Personal Access Tokens for Server/Data Center instances

### Tool Filtering System
Tools can be selectively enabled/disabled through:
- `ENABLED_TOOLS` environment variable (comma-separated list)
- `READ_ONLY_MODE` to disable all write operations
- Individual tool availability is checked via `isToolEnabled()` function