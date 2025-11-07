/**
 * Logging Helper Functions
 */

export const log = {
  info: (message: string, data: Record<string, unknown> = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...data
    }));
  },
  error: (message: string, error: Error | unknown, data: Record<string, unknown> = {}) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: errorObj.message,
      stack: errorObj.stack,
      ...data
    }));
  },
  success: (message: string, data: Record<string, unknown> = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'success',
      message,
      ...data
    }));
  }
};
