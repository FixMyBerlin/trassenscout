/**
 * Shared Configuration
 */

export type Config = {
  imap: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  folders: {
    inbox: string;
    done: string;
    error: string;
  };
  processing: {
    delay: number;
    maxRetries: number;
  };
  health: {
    port: number;
  };
}

export const config: Config = {
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
};
