/**
 * Shared Configuration
 */

export const config = {
  imap: {
    host: process.env.IMAP_HOST || "localhost",
    port: parseInt(process.env.IMAP_PORT || "993"),
    secure: process.env.IMAP_SECURE === "true",
    auth: {
      user: process.env.IMAP_USER || "",
      pass: process.env.IMAP_PASSWORD || "",
    },
  },
  folders: {
    inbox: "INBOX",
    done: "INBOX.DONE",
    error: "INBOX.ERROR",
  },
  processing: {
    delay: 10000, // 10 seconds delay between processing messages
    maxRetries: 3,
  },
  health: {
    port: 3100,
  },
} as const
