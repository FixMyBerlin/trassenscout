/**
 * Retention: permanently delete every email older than the configured age,
 * in every folder of the mailbox (including DONE, ERROR, Trash, Junk, Sent, Archive).
 */

import { subMonths } from "date-fns"
import { config } from "./config.js"
import { createImapClient } from "./imap.js"
import { log } from "./logger.js"

let isRunning = false

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

/**
 * Deletes all messages that arrived before `now - retention.months`.
 * Uses the server's arrival date (`before`), not the sender-controlled `Date:` header.
 * Only folder names and counts are logged, never message content.
 */
export async function runRetention() {
  if (isRunning) {
    log.info("Retention run already in progress, skipping")
    return
  }
  isRunning = true

  const { months, batchSize } = config.retention
  const cutoff = subMonths(new Date(), months)
  const client = createImapClient()
  let total = 0

  try {
    await client.connect()
    log.info("Retention run started", { cutoff: cutoff.toISOString(), months })

    const mailboxes = await client.list()
    for (const mailbox of mailboxes) {
      if (mailbox.flags.has("\\Noselect") || mailbox.flags.has("\\NonExistent")) continue

      const folder = mailbox.path
      try {
        const lock = await client.getMailboxLock(folder)
        try {
          const uids = await client.search({ before: cutoff }, { uid: true })
          if (!uids || uids.length === 0) continue

          for (const batch of chunk(uids, batchSize)) {
            await client.messageDelete(batch, { uid: true })
          }
          total += uids.length
          log.success("Retention deleted messages", { folder, count: uids.length })
        } finally {
          lock.release()
        }
      } catch (error) {
        log.error("Retention failed for folder", error, { folder })
      }
    }

    log.success("Retention run finished", { total })
  } catch (error) {
    log.error("Retention run failed", error)
  } finally {
    isRunning = false
    try {
      await client.logout()
    } catch {
      // Ignore logout errors during cleanup
    }
  }
}
