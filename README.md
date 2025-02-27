# MCP Atlassian

A Model Context Protocol (MCP) server that provides tools for interacting with Atlassian products (Confluence and Jira).

## Overview

This MCP server allows AI agents to interact with Atlassian products through a standardized interface. It provides tools for:

- **Confluence**: Search content, get spaces, retrieve content, and list pages
- **Jira**: Search issues, get issue details, list projects, and more

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

- **search-confluence**: Search for content in Confluence using CQL

  - Parameters: `query` (string)

- **get-confluence-space**: Get information about a specific Confluence space

  - Parameters: `spaceKey` (string)

- **get-confluence-content**: Get specific content by ID

  - Parameters: `contentId` (string)

- **get-confluence-pages**: Get all pages in a space
  - Parameters: `spaceKey` (string), `limit` (number, optional)

#### Jira Tools

- **search-jira-issues**: Search for issues using JQL

  - Parameters: `jql` (string), `maxResults` (number, optional)

- **get-jira-issue**: Get a specific issue by key

  - Parameters: `issueKey` (string)

- **get-jira-projects**: Get all projects

  - Parameters: none

- **get-jira-project**: Get a specific project by key

  - Parameters: `projectKey` (string)

- **get-jira-issue-types**: Get all issue types
  - Parameters: none

## Development

### Project Structure

```
src/
├── config/         # Configuration files
├── examples/       # Example usage
├── services/       # Service classes for Atlassian APIs
│   ├── confluence.ts
│   └── jira.ts
├── tools/          # MCP tools
│   ├── search-confluence.ts
│   ├── get-confluence-space.ts
│   ├── get-confluence-content.ts
│   ├── get-confluence-pages.ts
│   ├── search-jira-issues.ts
│   ├── get-jira-issue.ts
│   ├── get-jira-projects.ts
│   ├── get-jira-project.ts
│   ├── get-jira-issue-types.ts
│   ├── utils.ts
│   └── index.ts
└── index.ts        # Main entry point
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
