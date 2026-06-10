import { LangfuseSpanProcessor } from "@langfuse/otel"
import { NodeSDK } from "@opentelemetry/sdk-node"
import { setLangfuseSpanProcessor } from "@/src/server/observability/langfuseSpanProcessor.server"

declare global {
  // oxlint-disable-next-line no-var -- Nitro plugin can be loaded more than once in dev.
  var __trassenscoutOtelSdk: NodeSDK | undefined
}

export default function nitroOtelLangfusePlugin() {
  if (globalThis.__trassenscoutOtelSdk) return

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY
  const secretKey = process.env.LANGFUSE_SECRET_KEY

  if (!publicKey || !secretKey) {
    console.info("Langfuse OTEL disabled: LANGFUSE_PUBLIC_KEY or LANGFUSE_SECRET_KEY is missing.")
    return
  }

  const spanProcessor = new LangfuseSpanProcessor({
    publicKey,
    secretKey,
    baseUrl: process.env.LANGFUSE_BASEURL ?? process.env.LANGFUSE_BASE_URL,
    environment: process.env.VITE_APP_ENV ?? process.env.NODE_ENV,
  })

  setLangfuseSpanProcessor(spanProcessor)

  const sdk = new NodeSDK({
    serviceName: "trassenscout",
    spanProcessors: [spanProcessor],
  })

  sdk.start()
  globalThis.__trassenscoutOtelSdk = sdk
}
