import type { LangfuseSpanProcessor } from "@langfuse/otel"

let langfuseSpanProcessor: LangfuseSpanProcessor | undefined

export function setLangfuseSpanProcessor(processor: LangfuseSpanProcessor) {
  langfuseSpanProcessor = processor
}

export async function flushLangfuseSpans() {
  await langfuseSpanProcessor?.forceFlush()
}
