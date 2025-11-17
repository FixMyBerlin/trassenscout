/**
 * Logging Helper Functions
 */

import { berlinTimeString } from "./berlinTime.js"

export const log = {
  info: (message: string, data: Record<string, unknown> = {}) => {
    console.log(
      JSON.stringify({
        timestamp: berlinTimeString(new Date()),
        level: "info",
        message,
        ...data,
      }),
    )
  },
  error: (message: string, error: Error | unknown, data: Record<string, unknown> = {}) => {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    console.error(
      JSON.stringify({
        timestamp: berlinTimeString(new Date()),
        level: "error",
        message,
        error: errorObj.message,
        stack: errorObj.stack,
        ...data,
      }),
    )
  },
  success: (message: string, data: Record<string, unknown> = {}) => {
    console.log(
      JSON.stringify({
        timestamp: berlinTimeString(new Date()),
        level: "success",
        message,
        ...data,
      }),
    )
  },
}
