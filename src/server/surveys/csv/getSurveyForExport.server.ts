import { ZodError } from "zod"
import { AllowedSurveySlugsSchema } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import db from "@/src/server/db.server"
import { NotFoundError } from "@/src/shared/auth/errors"

/**
 * Fetches a survey for export purposes.
 * Auth is handled by the route handler via requireProjectRole.
 */
export async function getSurveyForExport(projectSlug: string, surveyId: number) {
  try {
    const survey = await db.survey.findFirstOrThrow({
      where: {
        id: surveyId,
        project: { slug: projectSlug },
      },
      include: { project: true },
    })

    const parsedSurvey = AllowedSurveySlugsSchema.safeParse(survey)
    if (!parsedSurvey.success) {
      throw new NotFoundError()
    }

    return { ...survey, slug: parsedSurvey.data.slug }
  } catch (error: unknown) {
    if (
      error instanceof NotFoundError ||
      (error as { code?: string }).code === "P2025" ||
      error instanceof ZodError
    ) {
      throw new NotFoundError("Survey not found")
    }
    throw error
  }
}
