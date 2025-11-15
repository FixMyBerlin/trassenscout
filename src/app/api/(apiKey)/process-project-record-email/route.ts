import { withApiKey } from "@/src/app/api/(apiKey)/_utils/withApiKey"
import { processProjectRecordEmailOrchestrator } from "@/src/server/ProjectRecordEmails/processEmail/processProjectRecordEmailOrchestrator"
import { z } from "zod"

const ProcessProjectRecordEmailSchema = z.object({
  projectRecordEmailId: z.number(),
})

export const GET = withApiKey(async ({ request }) => {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { projectRecordEmailId } = ProcessProjectRecordEmailSchema.parse(body)

    await processProjectRecordEmailOrchestrator({ projectRecordEmailId })

    return Response.json({ statusText: "Success" }, { status: 200 })
  } catch (error) {
    console.error("Error processing projectRecord email:", error)
    if (error instanceof Error && error.message === "ProjectRecordEmail not found") {
      return Response.json({ error: "ProjectRecordEmail not found" }, { status: 404 })
    }
    if (error instanceof Error && error.message === "Failed to process email with AI") {
      return Response.json({ error: "Failed to process email with AI" }, { status: 500 })
    }
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
})
