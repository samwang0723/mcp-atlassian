import { ConfluenceService } from '@/services/confluence';
import { JiraService } from '@/services/jira';

/**
 * Example of using the Confluence and Jira services
 */
async function atlassianExample() {
  try {
    // Initialize services
    const confluenceService = new ConfluenceService();
    const jiraService = new JiraService();

    console.log('Fetching data from Confluence...');

    // Example: Get a Confluence space
    const spaceKey = 'TMAB'; // Replace with your space key
    const space = await confluenceService.getSpace(spaceKey);
    console.log('Confluence Space:', space.name);

    // Example: Search for content in Confluence
    const searchQuery = 'type=page AND space=TMAB'; // Replace with your search query
    const searchResults = await confluenceService.searchContent(searchQuery);
    console.log(
      `Found ${searchResults.results.length} pages in Confluence search`,
    );

    console.log('\nFetching data from Jira...');

    // Example: Get a Jira project
    const projects = await jiraService.getProjects();
    console.log('Jira Projects:', projects);

    const projectKey = 'FIAT'; // Replace with your project key
    const project = await jiraService.getProject(projectKey);
    console.log('Jira Project:', (project as { name: string }).name);

    // Example: Search for issues in Jira
    const jql = 'project = FIAT AND status = "In Development"'; // Replace with your JQL query
    const issues = await jiraService.searchIssues(jql);
    console.log(
      `Found ${(issues as { issues: unknown[] }).issues.length} issues in Jira search`,
    );
  } catch (error) {
    console.error('Error in Atlassian example:', error);
  }
}

export default atlassianExample;
