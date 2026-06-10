/** Static imap-listener configuration — not environment-specific deploy secrets. */
export const IMAP_LISTENER = {
  secure: true,
  folders: {
    inbox: "INBOX",
    done: "INBOX/DONE",
    error: "INBOX/ERROR",
    excluded: ["INBOX/DONE", "INBOX/ERROR", "Junk", "Trash", "Sent", "Drafts", "Archive"],
  },
  api: {
    webhookPath: "/api/process-project-record-email",
    appHost: "app",
    appPort: 4000,
    devAppHost: "host.docker.internal",
  },
  processing: {
    delayMs: 10_000,
    maxRetries: 3,
  },
  health: {
    port: 3100,
  },
} as const
