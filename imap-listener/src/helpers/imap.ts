/**
 * IMAP Helper Functions
 */

import { ImapFlow, type ImapFlowOptions } from 'imapflow';
import { config } from './config.js';

/**
 * Creates an IMAP client with the configured settings
 */
export function createImapClient(): ImapFlow {
  const imapConfig: ImapFlowOptions = {
    host: config.imap.host,
    port: config.imap.port,
    secure: config.imap.secure,
    auth: {
      user: config.imap.auth.user,
      pass: config.imap.auth.pass,
    },
  };

  return new ImapFlow(imapConfig);
}

/**
 * Gets mailbox statistics (unseen in inbox and total in error folder)
 */
export async function getMailboxStats() {
  let client: ImapFlow | null = null;

  try {
    client = createImapClient();
    await client.connect();

    // Get unseen count in INBOX
    let lock = await client.getMailboxLock(config.folders.inbox);
    let inboxUnseen = 0;
    try {
      const unseenMessages = await client.search({ seen: false });
      inboxUnseen = unseenMessages === false ? 0 : unseenMessages.length;
    } finally {
      lock.release();
    }

    // Get message count in ERROR folder
    let errorCount = 0;
    try {
      lock = await client.getMailboxLock(config.folders.error);
      try {
        const status = await client.status(config.folders.error, { messages: true });
        errorCount = status.messages || 0;
      } finally {
        lock.release();
      }
    } catch (error) {
      // Error folder might not exist, that's okay
      console.error('Could not access ERROR folder:', error);
    }

    await client.logout();

    return {
      inboxUnseen,
      errorCount,
    };
  } catch (error) {
    if (client) {
      try {
        await client.logout();
      } catch (logoutError) {
        // Ignore logout errors
      }
    }
    throw error;
  }
}
