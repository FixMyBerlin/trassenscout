import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { enforcePublicEndpointRateLimit } from "@/src/server/auth/publicEndpointRateLimit.server"
import db from "@/src/server/db.server"
import { CreateSurveySessionSchema } from "./surveySessions.inputSchemas"

export { CreateSurveySessionSchema }

export async function createSurveySession(
  headers: Headers,
  input: z.infer<typeof CreateSurveySessionSchema>,
) {
  endpointAuth.public("public survey session creation with rate limiting")
  enforcePublicEndpointRateLimit(headers, "createSurveySession")

  return db.surveySession.create({
    data: input,
    select: { id: true },
  })
}
