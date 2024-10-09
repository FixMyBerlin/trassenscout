import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"

type GetFeedbackSurveyResponseAndCommentsInput = { projectSlug: string; id: number }

export default resolver.pipe(
  // @ts-expect-error
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ id }: GetFeedbackSurveyResponseAndCommentsInput) => {
    const feedbackSurveyResponse = await db.surveyResponse.findFirst({
      where: { id },
      include: {
        surveyResponseComments: {
          select: {
            id: true,
            surveyResponseId: true,
            createdAt: true,
            updatedAt: true,
            body: true,
            author: true,
          },
          orderBy: { id: "asc" },
        },
      },
    })

    if (!feedbackSurveyResponse) throw new NotFoundError()

    return feedbackSurveyResponse
  },
)
