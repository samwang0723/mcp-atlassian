/**
 * Safely stringify an object, handling potential circular references
 * @param obj The object to stringify
 * @returns A JSON string representation of the object
 */
export function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    },
    2,
  );
}

/**
 * Format a response for MCP tools
 * @param data The data to format
 * @returns A formatted response object
 */
export function formatResponse(data: any) {
  return {
    content: [
      {
        type: 'text' as const,
        text: safeStringify(data),
      },
    ],
  };
}

/**
 * Format an error response for MCP tools
 * @param err The error to format
 * @returns A formatted error response object
 */
export function formatErrorResponse(err: unknown) {
  const error = err instanceof Error ? err : new Error('Unknown error');
  return {
    content: [
      {
        type: 'text' as const,
        text: `Error: ${error.message}`,
      },
    ],
    isError: true,
  };
}
