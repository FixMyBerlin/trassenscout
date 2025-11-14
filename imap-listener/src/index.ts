/**
 * IMAP Listener Service - Entry Point
 *
 * Dieser Service überwacht ein IMAP-Postfach und leitet neue E-Mails
 * an die Trassenscout-API weiter.
 */

import { ImapFlow, type ListResponse } from "imapflow"
import { config } from "./helpers/config"
import { createImapClient } from "./helpers/imap"
import { log } from "./helpers/logger"

type ServiceStatus = {
  isHealthy: boolean
  lastCheck: string | null
  error: string | null
}

let serviceStatus: ServiceStatus = {
  isHealthy: false,
  lastCheck: null,
  error: null,
}

let client: ImapFlow | null = null
let isProcessing = false

/**
 * Process unseen emails in inbox (TEST implementation)
 * TODO: Replace with actual API call logic in #2772
 */
async function processUnseenMails(client: ImapFlow) {
  if (isProcessing) {
    log.info("Already processing mails, skipping...")
    return
  }

  isProcessing = true

  try {
    // Lock and open inbox
    const lock = await client.getMailboxLock(config.folders.inbox)

    try {
      // Search for unseen messages
      const unseenMessages = await client.search({ seen: false })

      // Check if search returned results
      if (!unseenMessages || unseenMessages.length === 0) {
        log.info("No unseen messages found")
        return
      }

      log.info("Found unseen messages", { count: unseenMessages.length })

      // Process each message
      for (const uid of unseenMessages) {
        try {
          // Fetch message details
          const message = await client.fetchOne(uid.toString(), {
            envelope: true,
            bodyStructure: true,
            source: true,
          })

          // Check if message was fetched successfully
          if (!message) {
            log.error("Failed to fetch message", new Error("Message not found"), { uid })
            continue
          }

          // Log message details to console (TEST output)
          log.info("Processing email", {
            uid: message.uid,
            from: message.envelope?.from?.[0]?.address || "unknown",
            subject: message.envelope?.subject || "(no subject)",
            date: message.envelope?.date?.toISOString() || "unknown",
            size: message.source?.length || 0,
          })

          // Mark as seen
          await client.messageFlagsAdd(uid.toString(), ["\\Seen"])
          log.info("Marked message as seen", { uid: message.uid })

          // Move to DONE folder
          await client.messageMove(uid.toString(), config.folders.done)
          log.success("Moved message to DONE folder", { uid: message.uid })

          // Delay between messages
          if (config.processing.delay > 0) {
            log.info("Waiting before processing next message", { delayMs: config.processing.delay })
            await new Promise((resolve) => setTimeout(resolve, config.processing.delay))
          }
        } catch (error) {
          log.error("Error processing individual message", error, { uid })
        }
      }
    } finally {
      lock.release()
    }
  } catch (error) {
    log.error("Error processing unseen mails", error)
  } finally {
    isProcessing = false
  }
}

async function verifyImapFolders(client: ImapFlow) {
  try {
    log.info("Verifying IMAP folder structure...")

    const mailboxes: ListResponse[] = await client.list()
    const existingFolders = mailboxes.map((mb) => mb.path)

    log.info("Available IMAP folders", { availableFolders: existingFolders })

    const requiredFolders = [config.folders.inbox, config.folders.done, config.folders.error]
    const missingFolders = requiredFolders.filter((folder) => !existingFolders.includes(folder))
    if (missingFolders.length > 0) {
      log.error("Required IMAP folders are missing", new Error("Missing folders"), {
        missingFolders,
        requiredFolders,
        existingFolders,
      })
      return false
    }

    log.success("All required IMAP folders exist")
    return true
  } catch (error) {
    log.error("Error verifying IMAP folders", error)
    return false
  }
}

async function startImapListener() {
  try {
    log.info("Starting IMAP Listener Service", {
      host: config.imap.host,
      port: config.imap.port,
      secure: config.imap.secure,
    })

    if (!config.imap.auth.user || !config.imap.auth.pass) {
      throw new Error("IMAP_USER and IMAP_PASSWORD environment variables are required")
    }

    client = createImapClient()

    await client.connect()
    log.success("Connected to IMAP server")

    const foldersExist = await verifyImapFolders(client)
    if (!foldersExist) {
      throw new Error("Required IMAP folders are missing. Please create them first.")
    }

    serviceStatus.isHealthy = true
    serviceStatus.lastCheck = new Date().toISOString()
    serviceStatus.error = null

    log.info("IMAP Listener Service is ready and monitoring mailbox")

    // Process existing unseen mails on startup
    log.info("Processing existing unseen mails...")
    await processUnseenMails(client)

    // Set up error handler
    client.on("error", (error: Error) => {
      log.error("IMAP connection error", error)
      serviceStatus.isHealthy = false
      serviceStatus.error = error instanceof Error ? error.message : String(error)
    })

    // Set up close handler
    client.on("close", () => {
      log.info("IMAP connection closed")
      serviceStatus.isHealthy = false
    })

    // Set up IDLE to monitor for new messages
    log.info("Setting up IDLE mode to monitor for new messages")

    const processMailbox = async () => {
      try {
        await processUnseenMails(client!)
      } catch (error) {
        log.error("Error in processMailbox", error)
      }
    }

    // Listen for new messages
    client.on("exists", async (data: { count: number }) => {
      log.info("New message detected", { count: data.count })
      await processMailbox()
    })

    // Keep service running (IDLE will be handled by exists event)
    log.info("Service is now monitoring for new emails...")
  } catch (error) {
    log.error("Failed to start IMAP listener", error)
    serviceStatus.isHealthy = false
    serviceStatus.error = error instanceof Error ? error.message : String(error)
    throw error
  }
}

async function shutdown() {
  log.info("Shutting down gracefully...")

  if (client) {
    try {
      await client.logout()
      log.info("IMAP connection closed")
    } catch (error) {
      log.error("Error closing IMAP connection", error)
    }
  }

  process.exit(0)
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)

process.on("unhandledRejection", (reason) => {
  log.error("Unhandled Promise Rejection", reason)
  shutdown()
})

startImapListener().catch((error) => {
  log.error("Fatal error during startup", error)
  process.exit(1)
})
