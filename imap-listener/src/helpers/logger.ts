/**
 * Logging Helper Functions
 */

import { berlinTimeString } from "./berlinTime.js"

export const log = {
  info: (message: string, data: Record<string, unknown> = {}) => {
    console.log("[INFO]", berlinTimeString(new Date()), message, JSON.stringify({ ...data }))
  },
  error: (message: string, error: Error | unknown, data: Record<string, unknown> = {}) => {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    console.error(
      "[ERROR]",
      berlinTimeString(new Date()),
      message,
      JSON.stringify({
        error: errorObj.message,
        stack: errorObj.stack,
        ...data,
      }),
    )
  },
  success: (message: string, data: Record<string, unknown> = {}) => {
    console.log("[SUCCESS]", berlinTimeString(new Date()), message, JSON.stringify({ ...data }))
  },
}
