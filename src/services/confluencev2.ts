import fetch, { RequestInit } from 'node-fetch';
import https from 'https';
import config from '@/config/env';

export interface ConfluenceV2SearchResult {
  id: string;
  status: string;
  title: string;
  createdAt: string;
  version: {
    number: number;
    authorId: string;
    message: string;
    createdAt: string;
  };
  spaceId?: string;
  parentId?: string;
  parentType?: string;
  position?: number;
  body?: {
    representation: string;
    value: string;
  };
  _links: {
    editui: string;
    webui: string;
    tinyui: string;
  };
}

export interface ConfluenceV2Space {
  id: string;
  key: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  homepageId: string;
  description?: {
    representation: string;
    value: string;
  };
  icon?: {
    path: string;
    width?: number;
    height?: number;
    isDefault?: boolean;
  };
  _links: {
    webui: string;
  };
}

export interface ConfluenceV2CreatePageRequest {
  spaceId: string;
  status: 'current' | 'draft';
  title: string;
  parentId?: string;
  body: {
    representation: 'storage' | 'atlas_doc_format' | 'wiki';
    value: string;
  };
}

export interface ConfluenceV2UpdatePageRequest {
  id: string;
  status: 'current' | 'draft';
  title: string;
  body: {
    representation: 'storage' | 'atlas_doc_format' | 'wiki';
    value: string;
  };
  version: {
    number: number;
    message?: string;
  };
}

export interface ConfluenceV2InlineComment {
  id: string;
  status: string;
  title: string;
  createdAt: string;
  version: {
    number: number;
    authorId: string;
    message: string;
    createdAt: string;
  };
  body: {
    representation: string;
    value: string;
  };
  resolutionStatus: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>;
  _links: {
    webui: string;
  };
}

export interface ConfluenceV2CreateFooterCommentRequest {
  blogPostId?: string;
  pageId?: string;
  parentCommentId?: string;
  attachmentId?: string;
  customContentId?: string;
  body: {
    representation: 'storage' | 'atlas_doc_format' | 'wiki';
    value: string;
  };
}

export interface ConfluenceV1Content {
  id: string;
  type: string;
  status: string;
  title: string;
  space: {
    key: string;
    name: string;
    type: string;
    status: string;
  };
  body?: {
    storage?: { value: string; representation: string };
    view?: { value: string; representation: string };
  };
  version: {
    when: string;
    number: number;
    minorEdit: boolean;
  };
}

export interface ConfluenceV1SearchResult {
  content: ConfluenceV1Content;
  title: string;
  excerpt: string;
  url: string;
  lastModified: string;
  friendlyLastModified: string;
  score: number;
}

export interface ConfluenceV1SearchResponse {
  results: ConfluenceV1SearchResult[];
  start: number;
  limit: number;
  size: number;
  totalSize: number;
  cqlQuery: string;
  searchDuration: number;
}

/**
 * Confluence v2 REST API service using node-fetch
 */
export class ConfluenceV2Service {
  private baseUrl: string;
  private headers: Record<string, string>;
  private httpsAgent?: https.Agent;

  constructor() {
    // Use the dedicated Confluence URL if available, otherwise derive from Atlassian host
    let host = config.confluence.url || config.atlassian.host;

    // Make sure the host URL doesn't end with /wiki
    host = host.replace(/\/wiki$/, '');

    this.baseUrl = `${host}/wiki/api/v2`;

    // Setup authentication headers
    const authMethod = config.atlassian.authMethod;

    if (authMethod === 'oauth' && config.atlassian.oauthClientId) {
      // OAuth would require token exchange - for now fall back to basic
      this.headers = {
        Authorization: `Basic ${Buffer.from(`${config.atlassian.email}:${config.atlassian.apiToken}`).toString('base64')}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
    } else if (config.confluence.username) {
      // Basic auth with username for older servers
      this.headers = {
        Authorization: `Basic ${Buffer.from(`${config.confluence.username}:${config.atlassian.apiToken}`).toString('base64')}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
    } else {
      // Standard basic auth with email/token
      this.headers = {
        Authorization: `Basic ${Buffer.from(`${config.atlassian.email}:${config.atlassian.apiToken}`).toString('base64')}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
    }

    // Setup HTTPS agent for SSL bypass if needed
    if (!config.confluence.sslVerify) {
      this.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options?.headers,
        },
        agent: this.httpsAgent,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error(`Error making request to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get a space by ID or key
   * @param spaceIdOrKey The ID or key of the space to retrieve
   * @returns The space object
   */
  async getSpace(spaceIdOrKey: string): Promise<ConfluenceV2Space> {
    return this.makeRequest<ConfluenceV2Space>(
      `/spaces/${encodeURIComponent(spaceIdOrKey)}`,
    );
  }

  /**
   * Get all spaces
   * @param limit The maximum number of results to return (default: 25)
   * @param cursor Cursor for pagination
   * @returns The spaces
   */
  async getSpaces(
    limit = 25,
    cursor?: string,
  ): Promise<{ results: ConfluenceV2Space[]; _links: { next?: string } }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append('cursor', cursor);

    return this.makeRequest(`/spaces?${params.toString()}`);
  }

  /**
   * Get a page by ID
   * @param pageId The ID of the page to retrieve
   * @param bodyFormat The format for the body content (default: storage)
   * @returns The page object
   */
  async getPage(
    pageId: string,
    bodyFormat: 'storage' | 'atlas_doc_format' | 'wiki' = 'storage',
  ): Promise<ConfluenceV2SearchResult> {
    const params = new URLSearchParams({ 'body-format': bodyFormat });
    return this.makeRequest<ConfluenceV2SearchResult>(
      `/pages/${encodeURIComponent(pageId)}?${params.toString()}`,
    );
  }

  /**
   * Get pages in a space
   * @param spaceId The ID of the space
   * @param limit The maximum number of results to return (default: 25)
   * @param cursor Cursor for pagination
   * @returns The pages in the space
   */
  async getPagesInSpace(
    spaceId: string,
    limit = 25,
    cursor?: string,
  ): Promise<{
    results: ConfluenceV2SearchResult[];
    _links: { next?: string };
  }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    if (cursor) params.append('cursor', cursor);

    return this.makeRequest(
      `/spaces/${encodeURIComponent(spaceId)}/pages?${params.toString()}`,
    );
  }

  /**
   * Search for pages by title using CQL-like query
   * @param title Title to search for
   * @param spaceId Optional space ID to limit search
   * @param limit The maximum number of results to return (default: 25)
   * @param cursor Cursor for pagination
   * @returns The search results
   */
  async searchPagesByTitle(
    title?: string,
    spaceId?: string,
    limit = 25,
    cursor?: string,
  ): Promise<{
    results: ConfluenceV2SearchResult[];
    _links: { next?: string };
  }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (title) params.append('title', title);
    if (spaceId) params.append('space-id', spaceId);
    if (cursor) params.append('cursor', cursor);

    return this.makeRequest(`/pages?${params.toString()}`);
  }

  /**
   * Search pages by content using v1 API with CQL
   * @param searchText Text to search for in page content
   * @param spaceKey Optional space key to limit search (uses space key, not ID)
   * @param limit The maximum number of results to return (default: 25)
   * @param start Starting index for pagination (v1 API uses start/limit instead of cursor)
   * @returns The search results (v1 API format)
   */
  async searchPagesByContent(
    searchText: string,
    spaceKey?: string,
    limit = 25,
    start = 0,
  ): Promise<ConfluenceV1SearchResponse> {
    let cql = `text~"${searchText}" and type=page`;
    if (spaceKey) {
      cql += ` and space=${spaceKey}`;
    }

    const params = new URLSearchParams({
      cql,
      limit: limit.toString(),
      start: start.toString(),
    });

    // Use v1 API search endpoint
    const v1BaseUrl = this.baseUrl.replace('/api/v2', '/rest/api');
    const url = `${v1BaseUrl}/search?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: this.headers,
        agent: this.httpsAgent,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return (await response.json()) as ConfluenceV1SearchResponse;
    } catch (error) {
      console.error(`Error making content search request to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Create a new page
   * @param pageData The page data to create
   * @returns The created page
   */
  async createPage(
    pageData: ConfluenceV2CreatePageRequest,
  ): Promise<ConfluenceV2SearchResult> {
    return this.makeRequest<ConfluenceV2SearchResult>('/pages', {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
  }

  /**
   * Update an existing page
   * @param updateData The data to update
   * @returns The updated page
   */
  async updatePage(
    updateData: ConfluenceV2UpdatePageRequest,
  ): Promise<ConfluenceV2SearchResult> {
    return this.makeRequest<ConfluenceV2SearchResult>(
      `/pages/${encodeURIComponent(updateData.id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      },
    );
  }

  /**
   * Update a page title only
   * @param pageId The ID of the page to update
   * @param title The new title for the page
   * @param status The status of the page (default: current)
   * @returns The updated page
   */
  async updatePageTitle(
    pageId: string,
    title: string,
    status: 'current' | 'draft' = 'current',
  ): Promise<ConfluenceV2SearchResult> {
    return this.makeRequest<ConfluenceV2SearchResult>(
      `/pages/${encodeURIComponent(pageId)}/title`,
      {
        method: 'PUT',
        body: JSON.stringify({
          status,
          title,
        }),
      },
    );
  }

  /**
   * Get pages by label
   * @param label The label to search for
   * @param limit The maximum number of results to return (default: 25)
   * @param cursor Cursor for pagination
   * @returns The page labels
   */
  async getPagesByLabel(
    label: string,
    limit = 25,
    spaceId?: string,
    cursor?: string,
  ): Promise<{
    results: Array<{ id: string; name: string; prefix: string }>;
    _links: { next?: string };
  }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (spaceId) params.append('space-id', spaceId);
    if (cursor) params.append('cursor', cursor);

    return this.makeRequest(
      `/labels/${encodeURIComponent(label)}/pages?${params.toString()}`,
    );
  }

  /**
   * Get inline comments on a page
   * @param pageId The ID of the page
   * @param limit The maximum number of results to return (default: 25)
   * @param cursor Cursor for pagination
   * @returns The inline comments on the page
   */
  async getPageInlineComments(
    pageId: string,
    limit = 25,
    cursor?: string,
  ): Promise<{
    results: ConfluenceV2InlineComment[];
    _links: { next?: string };
  }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append('cursor', cursor);

    return this.makeRequest(
      `/pages/${encodeURIComponent(pageId)}/inline-comments?${params.toString()}`,
    );
  }

  /**
   * Create a footer comment
   * @param commentData The comment data to create
   * @returns The created footer comment
   */
  async createFooterComment(
    commentData: ConfluenceV2CreateFooterCommentRequest,
  ): Promise<{
    id: string;
    status: string;
    title: string;
    body: { representation: string; value: string };
  }> {
    return this.makeRequest(`/footer-comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }
}
