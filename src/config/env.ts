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
  };
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
  },
};

export default config;
