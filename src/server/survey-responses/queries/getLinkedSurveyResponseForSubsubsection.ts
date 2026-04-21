import db, { SurveyResponseStateEnum } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"

type GetLinkedSurveyResponseForSubsubsectionInput = {
  projectSlug: string
  subsubsectionSlug: string
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, subsubsectionSlug }: GetLinkedSurveyResponseForSubsubsectionInput) => {
    if (projectSlug !== "ohv") return null

    const normalizedSubsubsectionSlug = subsubsectionSlug.toLowerCase()

    const responses = await db.surveyResponse.findMany({
      where: {
        state: SurveyResponseStateEnum.SUBMITTED,
        surveyPart: 2,
        surveySession: {
          survey: {
            project: { slug: projectSlug },
            slug: "ohv-haltestellenfoerderung",
          },
        },
      },
      select: {
        id: true,
        data: true,
        surveySession: {
          select: {
            surveyId: true,
            survey: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    })

    for (const response of responses) {
      try {
        const data = JSON.parse(response.data) as { referenceId?: unknown }
        if (
          typeof data.referenceId === "string" &&
          data.referenceId.toLowerCase() === normalizedSubsubsectionSlug
        ) {
          return {
            surveyResponseId: response.id,
            surveyId: response.surveySession.surveyId,
            surveySlug: response.surveySession.survey.slug,
          }
        }
      } catch {
        // ignore invalid legacy JSON and keep scanning
      }
    }

    return null
  },
)
