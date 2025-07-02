import { ConfluenceClient } from 'confluence.js';
import config from '@/config/env';

/**
 * Confluence service for interacting with the Confluence API
 */
export class ConfluenceService {
  private client: ConfluenceClient;

  constructor() {
    // Use the dedicated Confluence URL if available, otherwise derive from Atlassian host
    let host = config.confluence.url || config.atlassian.host;

    // Make sure the host URL doesn't end with /wiki
    host = host.replace(/\/wiki$/, '');

    // Configure authentication based on the method
    const authConfig: any = {};

    if (
      config.atlassian.authMethod === 'oauth' &&
      config.atlassian.oauthClientId
    ) {
      // OAuth configuration would go here
      // For now, fall back to basic auth
      authConfig.basic = {
        email: config.atlassian.email,
        apiToken: config.atlassian.apiToken,
      };
    } else if (config.confluence.username) {
      // Basic auth with username/password for older servers
      authConfig.basic = {
        email: config.confluence.username,
        apiToken: config.atlassian.apiToken,
      };
    } else {
      // Standard basic auth with email/token
      authConfig.basic = {
        email: config.atlassian.email,
        apiToken: config.atlassian.apiToken,
      };
    }

    this.client = new ConfluenceClient({
      host,
      authentication: authConfig,
      // Note: confluence.js doesn't directly support SSL verification settings
      // SSL settings would need to be configured at the HTTP client level
    });
  }

  /**
   * Get a space by key
   * @param spaceKey The key of the space to retrieve
   * @returns The space object
   */
  async getSpace(spaceKey: string) {
    try {
      return await this.client.space.getSpace({ spaceKey });
    } catch (error) {
      console.error(`Error getting space ${spaceKey}:`, error);
      throw error;
    }
  }

  /**
   * Get content by ID
   * @param contentId The ID of the content to retrieve
   * @returns The content object
   */
  async getContent(contentId: string) {
    try {
      return await this.client.content.getContentById({
        id: contentId,
        expand: ['body.storage', 'version', 'space'],
      });
    } catch (error) {
      console.error(`Error getting content ${contentId}:`, error);
      throw error;
    }
  }

  /**
   * Search for content in Confluence
   * @param cql The Confluence Query Language (CQL) query
   * @param limit The maximum number of results to return
   * @returns The search results
   */
  async searchContent(cql: string, limit = 10) {
    try {
      return await this.client.search.search({
        cql,
        limit,
      });
    } catch (error) {
      console.error(`Error searching content with query ${cql}:`, error);
      throw error;
    }
  }

  /**
   * Get all pages in a space
   * @param spaceKey The key of the space
   * @param limit The maximum number of results to return
   * @returns The pages in the space
   */
  async getPagesInSpace(spaceKey: string, limit = 100) {
    try {
      return await this.client.content.getContent({
        spaceKey,
        type: 'page',
        limit,
        expand: ['body.storage', 'version'],
      });
    } catch (error) {
      console.error(`Error getting pages in space ${spaceKey}:`, error);
      throw error;
    }
  }

  /**
   * Create a new page
   * @param pageData The page data to create
   * @returns The created page
   */
  async createPage(pageData: {
    spaceKey: string;
    title: string;
    content: string;
    parentId?: string;
  }) {
    try {
      const page = {
        type: 'page',
        title: pageData.title,
        space: { key: pageData.spaceKey },
        body: {
          storage: {
            value: pageData.content,
            representation: 'storage',
          },
        },
        ...(pageData.parentId && { ancestors: [{ id: pageData.parentId }] }),
      };

      return await this.client.content.createContent(page);
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  /**
   * Update an existing page
   * @param pageId The ID of the page to update
   * @param updateData The data to update
   * @returns The updated page
   */
  async updatePage(
    pageId: string,
    updateData: {
      title?: string;
      content?: string;
      version: number;
    },
  ) {
    try {
      const page: any = {
        version: { number: updateData.version },
      };

      if (updateData.title) page.title = updateData.title;
      if (updateData.content) {
        page.body = {
          storage: {
            value: updateData.content,
            representation: 'storage',
          },
        };
      }

      return await this.client.content.updateContent({ id: pageId, ...page });
    } catch (error) {
      console.error(`Error updating page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a page
   * @param pageId The ID of the page to delete
   * @returns Success status
   */
  async deletePage(pageId: string) {
    try {
      return await this.client.content.deleteContent({ id: pageId });
    } catch (error) {
      console.error(`Error deleting page ${pageId}:`, error);
      throw error;
    }
  }

  // TODO: Implement the following methods when API signatures are clarified:
  // - addComment
  // - getComments
  // - getPageChildren
  // - getLabels
  // - addLabel
}
