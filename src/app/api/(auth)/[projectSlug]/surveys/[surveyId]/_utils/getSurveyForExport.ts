import db from "@/db"
import {
  allowedSurveySlugs,
  AllowedSurveySlugsSchema,
} from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { NotFoundError } from "blitz"
import { ZodError } from "zod"

/**
 * Fetches a survey for export purposes.
 * Auth is already handled by the route wrapper (withProjectMembership),
 * so this function directly queries the database without redundant authorization checks.
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

    // Validate survey slug against allowed list (same business rule as resolver)
    if (!allowedSurveySlugs.includes(survey.slug as any)) {
      throw new NotFoundError()
    }

    // Validate and parse with schema
    const zod = AllowedSurveySlugsSchema.parse(survey)
    return { ...survey, slug: zod.slug }
  } catch (error: any) {
    // Map common errors to HTTP responses consistent with current pages routes
    if (error instanceof NotFoundError || error.code === "P2025" || error instanceof ZodError) {
      throw new NotFoundError("Survey not found")
    }
    throw error
  }
}
