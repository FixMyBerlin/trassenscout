import { z } from "zod"
import { IMAP_LISTENER } from "./constants.js"

const imapListenerEnvSchema = z.object({
  IMAP_HOST: z.string().min(1),
  IMAP_PORT: z.coerce.number().int().positive(),
  IMAP_USER: z.string().min(1),
  IMAP_PASSWORD: z.string().min(1),
  TS_API_KEY: z.string().min(1),
  NODE_ENV: z.string().optional(),
})

function parseImapListenerEnv() {
  const parsed = imapListenerEnvSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error("Invalid imap-listener environment", z.prettifyError(parsed.error))
    throw new Error("Invalid imap-listener environment")
  }

  return parsed.data
}

const env = parseImapListenerEnv()

function resolveWebhookUrl() {
  const { webhookPath, appHost, appPort, devAppHost } = IMAP_LISTENER.api
  const host = env.NODE_ENV === "production" ? appHost : devAppHost
  return `http://${host}:${appPort}${webhookPath}`
}

export const config = {
  imap: {
    host: env.IMAP_HOST,
    port: env.IMAP_PORT,
    secure: IMAP_LISTENER.secure,
    auth: {
      user: env.IMAP_USER,
      pass: env.IMAP_PASSWORD,
    },
  },
  api: {
    webhookUrl: resolveWebhookUrl(),
    apiKey: env.TS_API_KEY,
  },
  folders: IMAP_LISTENER.folders,
  processing: {
    delay: IMAP_LISTENER.processing.delayMs,
    maxRetries: IMAP_LISTENER.processing.maxRetries,
  },
  health: IMAP_LISTENER.health,
} as const
