import { z } from "zod"
import { SurveyResponseStateEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { GetSurveyTabsSchema } from "./surveyTabs.inputSchemas"

export async function getSurveyTabs(headers: Headers, input: z.infer<typeof GetSurveyTabsSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const surveyResponses = await db.surveyResponse.findMany({
    where: {
      state: SurveyResponseStateEnum.SUBMITTED,
      surveySession: {
        survey: { project: { slug: input.projectSlug } },
        surveyId: input.surveyId,
      },
      surveyPart: 2,
    },
    include: {
      surveySession: { include: { survey: { select: { slug: true } } } },
    },
    take: 1,
    orderBy: { id: "desc" },
  })

  const hasMapResponses = surveyResponses.length > 0

  return [
    {
      name: "Beiträge",
      to: `/${input.projectSlug}/surveys/${input.surveyId}/responses`,
    },
    ...(hasMapResponses
      ? [
          {
            name: "Beiträge (Karte)",
            to: `/${input.projectSlug}/surveys/${input.surveyId}/responses/map`,
          },
        ]
      : []),
    {
      name: "Auswertung",
      to: `/${input.projectSlug}/surveys/${input.surveyId}`,
    },
  ]
}
