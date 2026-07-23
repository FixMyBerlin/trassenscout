import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import { GetSurveyTabsSchema } from "./surveyTabs.inputSchemas"

export async function getSurveyTabs(headers: Headers, input: z.infer<typeof GetSurveyTabsSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  return [
    {
      name: "Eingaben",
      to: `/${input.projectSlug}/surveys/${input.surveyId}/responses`,
      activeForSubpaths: true,
    },
    {
      name: "Auswertung",
      to: `/${input.projectSlug}/surveys/${input.surveyId}/analysis`,
    },
  ]
}
