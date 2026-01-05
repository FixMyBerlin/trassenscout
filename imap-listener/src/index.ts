/**
 * IMAP Listener Service - Entry Point
 *
 * Dieser Service überwacht ein IMAP-Postfach und leitet neue E-Mails
 * an die Trassenscout-API weiter.
 */

import { ImapFlow, type ListResponse } from "imapflow"
import { config } from "./helpers/config.js"
import { createImapClient } from "./helpers/imap.js"
import { log } from "./helpers/logger.js"
import "./healthcheck.js"

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

// Map to hold IDLE connections for each folder
const folderClients = new Map<string, ImapFlow>()
// Track which folders are currently processing
const processingFolders = new Set<string>()
// Interval for refreshing folder list
let folderRefreshInterval: NodeJS.Timeout | null = null

/**
 * Fetch list of all folders from the email account
 */
async function fetchFolderList(client: ImapFlow) {
  const mailboxes: ListResponse[] = await client.list()
  return mailboxes.map((mb) => mb.path)
}

/**
 * Check if folder should be monitored
 */
function shouldMonitorFolder(folderPath: string) {
  return !(config.folders.excluded as readonly string[]).includes(folderPath)
}

/**
 * Process unseen emails in a specific folder
 */
async function processUnseenMails(client: ImapFlow, folderPath: string) {
  const processingKey = folderPath

  if (processingFolders.has(processingKey)) {
    log.info("Already processing mails in folder, skipping...", { folder: folderPath })
    return
  }

  processingFolders.add(processingKey)

  try {
    // Lock and open folder
    const lock = await client.getMailboxLock(folderPath)

    try {
      // Search for unseen messages in current mailbox
      const unseenMessageUids = await client.search({ seen: false })

      // Check if search returned results
      if (!unseenMessageUids || unseenMessageUids.length === 0) {
        log.info("No unseen messages found", { folder: folderPath })
        return
      }

      log.info("Found unseen messages", { folder: folderPath, count: unseenMessageUids.length })

      // Process each message
      for (const uid of unseenMessageUids) {
        try {
          // Fetch message details
          const message = await client.fetchOne(uid.toString(), {
            envelope: true,
            bodyStructure: true,
            source: true,
          })

          if (!message) {
            throw new Error("Message not found")
          }

          // Log message details
          log.info("Processing email", {
            folder: folderPath,
            uid: message.uid,
            from: message.envelope?.from?.[0]?.address || "unknown",
            subject: message.envelope?.subject || "(no subject)",
            date: message.envelope?.date?.toISOString() || "unknown",
            size: message.source?.length || 0,
          })

          const rawEmailText = message.source?.toString() || ""

          // Call Trassenscout API
          let apiSuccess = false
          try {
            const apiUrl = `${config.api.webhookUrl}?apiKey=${config.api.apiKey}`
            log.info("Calling API", { url: apiUrl, folder: folderPath })

            const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              // todo: projectSlug should be dynamic based on email sub adressing
              body: JSON.stringify({ rawEmailText, projectSlug: folderPath }),
            })

            if (!response.ok) {
              throw new Error(`API returned ${response.status}: ${response.statusText}`)
            }

            const result = await response.json()
            log.success("API call successful", { folder: folderPath, uid: message.uid, result })
            apiSuccess = true
          } catch (apiError) {
            log.error("API call failed", apiError, { folder: folderPath, uid: message.uid })
          } finally {
            // Mark as seen and move to appropriate folder
            await client.messageFlagsAdd(uid.toString(), ["\\Seen"])
            log.info("Marked message as seen", { folder: folderPath, uid: message.uid })

            const targetFolder = apiSuccess ? config.folders.done : config.folders.error
            await client.messageMove(uid.toString(), targetFolder)

            if (apiSuccess) {
              log.success(`Moved message to ${targetFolder} folder`, {
                folder: folderPath,
                uid: message.uid,
              })
            } else {
              log.error(`Moved message to ${targetFolder} folder`, new Error("API call failed"), {
                folder: folderPath,
                uid: message.uid,
              })
            }
          }

          // Delay between messages
          if (config.processing.delay > 0) {
            log.info("Waiting before processing next message", { delayMs: config.processing.delay })
            await new Promise((resolve) => setTimeout(resolve, config.processing.delay))
          }
        } catch (error) {
          log.error("Error processing individual message", error, { folder: folderPath, uid })
        }
      }
    } finally {
      lock.release()
    }
  } catch (error) {
    log.error("Error processing unseen mails", error, { folder: folderPath })
    throw error
  } finally {
    processingFolders.delete(processingKey)
  }
}

/**
 * Verify target folders (done/error) exist where we move processed emails
 */
async function verifyTargetFolders(client: ImapFlow) {
  log.info("Verifying target folders for processed emails...")

  const mailboxes: ListResponse[] = await client.list()
  const existingFolders = mailboxes.map((mb) => mb.path)

  const targetFolders = [config.folders.done, config.folders.error]
  const missingFolders = targetFolders.filter((folder) => !existingFolders.includes(folder))

  if (missingFolders.length > 0) {
    throw new Error(
      `Target folders for processed emails are missing: ${missingFolders.join(", ")}. Please create them first.`,
    )
  }

  log.success("Target folders exist", { folders: targetFolders })
}

/**
 * Setup IDLE monitoring for a specific folder
 */
async function setupFolderMonitoring(folderPath: string) {
  try {
    log.info("Setting up monitoring for folder", { folder: folderPath })

    const client = createImapClient()
    await client.connect()

    // Verify folder can be opened
    const lock = await client.getMailboxLock(folderPath)
    lock.release()

    // Process existing unseen mails
    await processUnseenMails(client, folderPath)

    // Set up error handler
    client.on("error", (error: Error) => {
      log.error("IMAP connection error", error, { folder: folderPath })
      // Try to reconnect
      setTimeout(() => {
        log.info("Attempting to reconnect to folder", { folder: folderPath })
        setupFolderMonitoring(folderPath).catch((err) => {
          log.error("Failed to reconnect to folder", err, { folder: folderPath })
        })
      }, 5000)
    })

    // Set up close handler
    client.on("close", () => {
      log.info("IMAP connection closed", { folder: folderPath })
      folderClients.delete(folderPath)
    })

    // Listen for new messages
    client.on("exists", async (data: { count: number }) => {
      log.info("New message detected", { folder: folderPath, count: data.count })
      try {
        await processUnseenMails(client, folderPath)
      } catch (error) {
        log.error("Error processing mailbox", error, { folder: folderPath })
      }
    })

    folderClients.set(folderPath, client)
    log.success("Successfully monitoring folder", { folder: folderPath })
  } catch (error) {
    log.error("Failed to setup monitoring for folder", error, { folder: folderPath })
    throw error
  }
}

/**
 * Update folder monitoring by fetching current folder list
 */
async function updateFolderMonitoring() {
  try {
    log.info("Updating folder monitoring...")

    // Create temporary client to fetch folder list
    const tempClient = createImapClient()
    await tempClient.connect()

    const folders = await fetchFolderList(tempClient)
    await tempClient.logout()

    // Get folders to monitor
    const foldersToMonitor = folders.filter(shouldMonitorFolder)

    log.info("Folders to monitor", { folders: foldersToMonitor })

    // Start monitoring new folders
    for (const folder of foldersToMonitor) {
      if (!folderClients.has(folder)) {
        log.info("Starting monitoring for new folder", { folder })
        await setupFolderMonitoring(folder)
      }
    }

    // Stop monitoring removed folders
    for (const [folder, client] of folderClients.entries()) {
      if (!foldersToMonitor.includes(folder)) {
        log.info("Stopping monitoring for removed folder", { folder })
        await client.logout()
        folderClients.delete(folder)
      }
    }

    log.success("Folder monitoring updated successfully")
  } catch (error) {
    log.error("Error updating folder monitoring", error)
    throw error
  }
}

async function startImapListener() {
  log.info("Starting IMAP Listener Service", {
    host: config.imap.host,
    port: config.imap.port,
    secure: config.imap.secure,
  })

  if (!config.imap.auth.user || !config.imap.auth.pass) {
    throw new Error("IMAP_USER and IMAP_PASSWORD environment variables are required")
  }

  // Verify target folders (done/error) exist before we start processing
  const tempClient = createImapClient()
  await tempClient.connect()
  await verifyTargetFolders(tempClient)
  await tempClient.logout()

  // Initial folder monitoring setup
  await updateFolderMonitoring()

  // Set up periodic folder list refresh (every 60 seconds)
  folderRefreshInterval = setInterval(async () => {
    await updateFolderMonitoring()
  }, 60 * 1000)

  serviceStatus.isHealthy = true
  serviceStatus.lastCheck = new Date().toISOString()
  serviceStatus.error = null

  log.success("IMAP Listener Service is ready and monitoring all folders")
}

async function shutdown() {
  log.info("Shutting down gracefully...")

  // Clear folder refresh interval
  if (folderRefreshInterval) {
    clearInterval(folderRefreshInterval)
    folderRefreshInterval = null
  }

  // Close all folder connections
  for (const [folder, client] of folderClients.entries()) {
    try {
      log.info("Closing connection for folder", { folder })
      await client.logout()
    } catch (error) {
      log.error("Error closing IMAP connection", error, { folder })
    }
  }

  folderClients.clear()
  processingFolders.clear()

  log.info("Shutdown complete")
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
