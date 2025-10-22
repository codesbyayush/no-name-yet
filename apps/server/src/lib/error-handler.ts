/**
 * Log error with context for debugging
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  //TODO: Use structured logging instead of console
  const errorInfo = {
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error(errorInfo);
}
