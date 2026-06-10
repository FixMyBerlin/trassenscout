import { propagateAttributes, startActiveObservation } from "@langfuse/tracing"
import { flushLangfuseSpans } from "@/src/server/observability/langfuseSpanProcessor.server"

type RunWithLangfuseAiObservationParams<T> = {
  name: string
  userId: string
  fn: () => Promise<T>
}

export async function runWithLangfuseAiObservation<T>({
  name,
  userId,
  fn,
}: RunWithLangfuseAiObservationParams<T>) {
  try {
    return await startActiveObservation(name, async () => propagateAttributes({ userId }, fn))
  } finally {
    await flushLangfuseSpans()
  }
}
