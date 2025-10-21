import { registerOTel } from "@vercel/otel"
import { LangfuseExporter } from "langfuse-vercel"

export function register() {
  registerOTel({
    serviceName: "ts-ai-email-processor",
    traceExporter: new LangfuseExporter({ environment: process.env.NODE_ENV }),
  })
}

// copied from ai hero example; langfuse docs recommend different approach for Next.js, but this does works
// see https://langfuse.com/integrations/frameworks/vercel-ai-sdk
