import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface Config {
  server: {
    port: number;
    host: string;
  };
  api: {
    key: string;
    url: string;
  };
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  atlassian: {
    host: string;
    email: string;
    apiToken: string;
    // OAuth support
    oauthClientId?: string;
    oauthClientSecret?: string;
    oauthRedirectUri?: string;
    oauthScope?: string;
    oauthCloudId?: string;
    // SSL configuration
    sslVerify: boolean;
    // Authentication method
    authMethod: 'basic' | 'oauth' | 'pat';
  };
  jira: {
    url: string;
    sslVerify: boolean;
  };
  confluence: {
    url: string;
    sslVerify: boolean;
    username?: string; // For older Confluence servers
  };
  // Tool filtering and access control
  enabledTools?: string[];
  readOnlyMode: boolean;
}

// Get environment variables with validation and defaults
const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
  },
  api: {
    key: process.env.API_KEY || '',
    url: process.env.API_URL || 'https://api.example.com',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'atlassian_db',
  },
  atlassian: {
    host: process.env.ATLASSIAN_HOST || '',
    email: process.env.ATLASSIAN_EMAIL || '',
    apiToken: process.env.ATLASSIAN_API_TOKEN || '',
    // OAuth configuration
    oauthClientId: process.env.ATLASSIAN_OAUTH_CLIENT_ID,
    oauthClientSecret: process.env.ATLASSIAN_OAUTH_CLIENT_SECRET,
    oauthRedirectUri: process.env.ATLASSIAN_OAUTH_REDIRECT_URI,
    oauthScope: process.env.ATLASSIAN_OAUTH_SCOPE,
    oauthCloudId: process.env.ATLASSIAN_OAUTH_CLOUD_ID,
    // SSL configuration
    sslVerify: process.env.ATLASSIAN_SSL_VERIFY !== 'false',
    // Authentication method
    authMethod:
      (process.env.ATLASSIAN_AUTH_METHOD as 'basic' | 'oauth' | 'pat') ||
      'basic',
  },
  jira: {
    url: process.env.JIRA_URL || process.env.ATLASSIAN_HOST || '',
    sslVerify: process.env.JIRA_SSL_VERIFY !== 'false',
  },
  confluence: {
    url:
      process.env.CONFLUENCE_URL ||
      (process.env.ATLASSIAN_HOST ? `${process.env.ATLASSIAN_HOST}/wiki` : ''),
    sslVerify: process.env.CONFLUENCE_SSL_VERIFY !== 'false',
    username: process.env.CONFLUENCE_USERNAME, // For basic auth on older servers
  },
  // Tool filtering
  enabledTools: process.env.ENABLED_TOOLS
    ? process.env.ENABLED_TOOLS.split(',').map((t) => t.trim())
    : undefined,
  readOnlyMode: process.env.READ_ONLY_MODE === 'true',
};

// Validation
if (!config.atlassian.host && !config.jira.url && !config.confluence.url) {
  console.warn(
    'Warning: No Atlassian host configured. Please set ATLASSIAN_HOST, JIRA_URL, or CONFLUENCE_URL',
  );
}

if (!config.atlassian.email && !config.atlassian.oauthClientId) {
  console.warn(
    'Warning: No authentication configured. Please set ATLASSIAN_EMAIL or OAuth credentials',
  );
}

if (!config.atlassian.apiToken && !config.atlassian.oauthClientSecret) {
  console.warn('Warning: No API token or OAuth secret configured');
}

export default config;
