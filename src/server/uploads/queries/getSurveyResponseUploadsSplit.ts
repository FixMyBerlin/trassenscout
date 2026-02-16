import db from "@/db"
import { AllowedSurveySlugsSchema } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { NumberArraySchema } from "@/src/core/utils/schema-shared"
import { uploadWithSubsectionsInclude } from "@/src/server/uploads/_utils/uploadInclude"
import { resolver } from "@blitzjs/rpc"

type GetSurveyResponseUploadsSplitInput = {
  projectSlug: string
  surveyResponseId: number
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, surveyResponseId }: GetSurveyResponseUploadsSplitInput) => {
    const surveyResponse = await db.surveyResponse.findFirst({
      where: {
        id: surveyResponseId,
        surveySession: {
          survey: { project: { slug: projectSlug } },
        },
      },
      select: {
        data: true,
        surveySession: { select: { survey: { select: { slug: true } } } },
      },
    })

    if (!surveyResponse) {
      return { uploadsInData: [], uploadsNotInData: [] }
    }

    // Universe for this query: ALL uploads linked to the response (Upload.surveyResponseId),
    // independent of whether the response.data references them or not.
    const uploads = await db.upload.findMany({
      where: {
        project: { slug: projectSlug },
        surveyResponseId,
      },
      orderBy: { id: "desc" },
      include: uploadWithSubsectionsInclude,
    })

    const data = JSON.parse(surveyResponse.data) as Record<string, unknown>

    // Determine the key in response.data that stores the upload IDs.
    // For legacy surveys this can be a numeric ref (via getQuestionIdBySurveySlug), hence the slug parsing.
    const parsedSurveySlug = AllowedSurveySlugsSchema.safeParse({
      slug: surveyResponse.surveySession.survey.slug,
    })
    const uploadsQuestionId = parsedSurveySlug.success
      ? getQuestionIdBySurveySlug(parsedSurveySlug.data.slug, "uploads")
      : undefined

    // If the response.data doesn't contain any upload references, everything is "not in data".
    if (!uploadsQuestionId || !(uploadsQuestionId in data)) {
      return { uploadsInData: [], uploadsNotInData: uploads }
    }

    const rawUploadIds = data[uploadsQuestionId]
    // Same coercion logic as the client: accept single values or arrays, coerce strings → numbers.
    const uploadIdsInData = NumberArraySchema.parse(
      Array.isArray(rawUploadIds) ? rawUploadIds : rawUploadIds ? [rawUploadIds] : [],
    )

    if (uploadIdsInData.length === 0) {
      return { uploadsInData: [], uploadsNotInData: uploads }
    }

    // Build the two groups:
    // - uploadsInData: ordered like the IDs stored in response.data
    // - uploadsNotInData: the remaining linked uploads
    const uploadMap = new Map(uploads.map((u) => [u.id, u]))

    const uploadsInData = uploadIdsInData
      .map((id) => uploadMap.get(id))
      .filter((u): u is NonNullable<typeof u> => u != null)

    const uploadsInDataIds = new Set(uploadsInData.map((u) => u.id))
    const uploadsNotInData = uploads.filter((u) => !uploadsInDataIds.has(u.id))

    return {
      uploadsInData,
      uploadsNotInData,
    }
  },
)
