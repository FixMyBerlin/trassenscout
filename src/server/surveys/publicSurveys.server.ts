import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { NotFoundError } from "@/src/shared/auth/errors"
import { GetPublicSurveyBySlugSchema } from "./publicSurveys.inputSchemas"

export { GetPublicSurveyBySlugSchema }

export async function getPublicSurveyBySlug(input: z.infer<typeof GetPublicSurveyBySlugSchema>) {
  endpointAuth.public("public beteiligung survey lookup by slug")
  const survey = await db.survey.findFirst({
    where: { slug: input.slug },
    select: { slug: true, id: true, active: true },
  })
  if (!survey) throw new NotFoundError()
  return survey
}
