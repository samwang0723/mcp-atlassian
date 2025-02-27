import { ConfluenceClient } from 'confluence.js';
import config from '@/config/env';

/**
 * Confluence service for interacting with the Confluence API
 */
export class ConfluenceService {
  private client: ConfluenceClient;

  constructor() {
    // Make sure the host URL doesn't end with /wiki
    const host = config.atlassian.host.replace(/\/wiki$/, '');

    this.client = new ConfluenceClient({
      host,
      authentication: {
        basic: {
          email: config.atlassian.email,
          apiToken: config.atlassian.apiToken,
        },
      },
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
      return await this.client.search.searchByCQL({
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
}
