import config from '@/config/env';

// Define tool categories
export const READ_TOOLS = [
  'search_confluence',
  'get_confluence_space',
  'get_confluence_content',
  'get_confluence_pages',
  'search_jira_issues',
  'get_jira_issue',
  'jira_get_transitions',
  'jira_get_all_projects',
];

export const WRITE_TOOLS = [
  'confluence_create_page',
  'confluence_update_page',
  'confluence_delete_page',
  'jira_create_issue',
  'jira_update_issue',
  'jira_add_comment',
  'jira_transition_issue',
];

export const ALL_TOOLS = [...READ_TOOLS, ...WRITE_TOOLS];

/**
 * Check if a tool should be enabled based on configuration
 * @param toolName The name of the tool to check
 * @returns Whether the tool should be enabled
 */
export function isToolEnabled(toolName: string): boolean {
  // If read-only mode is enabled, only allow read tools
  if (config.readOnlyMode && !READ_TOOLS.includes(toolName)) {
    return false;
  }

  // If specific tools are configured, only allow those
  if (config.enabledTools && config.enabledTools.length > 0) {
    return config.enabledTools.includes(toolName);
  }

  // By default, all tools are enabled (unless read-only mode restricts them)
  return true;
}

/**
 * Get the list of enabled tools based on configuration
 * @returns Array of enabled tool names
 */
export function getEnabledTools(): string[] {
  return ALL_TOOLS.filter((tool) => isToolEnabled(tool));
}

/**
 * Log the enabled tools for debugging
 */
export function logEnabledTools(): void {
  const enabledTools = getEnabledTools();
  console.log(
    `Enabled tools (${enabledTools.length}):`,
    enabledTools.join(', '),
  );

  if (config.readOnlyMode) {
    console.log('Read-only mode is enabled - write operations are disabled');
  }

  if (config.enabledTools) {
    console.log('Tool filtering is active:', config.enabledTools.join(', '));
  }
}
