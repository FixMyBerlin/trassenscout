import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { processIncomingProjectRecordEmail } from "@/src/server/projectRecordEmails/incoming/processIncomingEmail.server"
import { validationErrorState } from "@/src/server/utils/validation"
import { AuthorizationError } from "@/src/shared/auth/errors"

const ProcessProjectRecordEmailSchema = z.object({
  rawEmailText: z.string(),
  projectSlug: z.string().min(1).optional(),
})

export const Route = createFileRoute("/api/process-project-record-email/")({
  ssr: false,
  server: {
    handlers: {
      POST: async ({ request }) => {
        endpointAuth.apiKey(request)

        try {
          const body = await request.json()
          const parsed = ProcessProjectRecordEmailSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(validationErrorState(parsed.error), { status: 400 })
          }

          const { rawEmailText, projectSlug } = parsed.data
          await processIncomingProjectRecordEmail({ rawEmailText, projectSlug })

          return Response.json({ statusText: "Success" }, { status: 200 })
        } catch (error) {
          console.error("Error processing projectRecord email:", error)

          if (error instanceof AuthorizationError) {
            return Response.json({ statusText: "Unauthorized" }, { status: 401 })
          }

          if (error instanceof Error && error.message === "ProjectRecordEmail not found") {
            return Response.json({ error: "ProjectRecordEmail not found" }, { status: 404 })
          }

          if (error instanceof Error && error.message === "Failed to process email with AI") {
            return Response.json({ error: "Failed to process email with AI" }, { status: 500 })
          }

          return Response.json({ error: "Internal server error" }, { status: 500 })
        }
      },
    },
  },
})
