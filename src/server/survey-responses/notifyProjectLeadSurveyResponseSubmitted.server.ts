import { surveyResponseSubmittedNotificationToProjectLead } from "@/emails/mailers/surveyResponseSubmittedNotificationToProjectLead"
import { AllowedSurveySlugsSchema } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { enforcePublicEndpointRateLimit } from "@/src/server/auth/publicEndpointRateLimit.server"
import db from "@/src/server/db.server"
import { findProjectLead } from "@/src/server/projects/findProjectLead.server"

type Props = {
  headers: Headers
  surveyResponseId: number
  surveySessionId: number
}

// The Eingabe is already saved, so a failing mail is only logged.
export async function notifyProjectLeadSurveyResponseSubmitted({
  headers,
  surveyResponseId,
  surveySessionId,
}: Props) {
  try {
    // Same limit as the participant mail, so the public form can't flood the Projektleitung.
    enforcePublicEndpointRateLimit(headers, "notifyProjectLeadSurveyResponseSubmitted", { max: 10 })

    const surveySession = await db.surveySession.findUnique({
      where: { id: surveySessionId },
      select: {
        survey: {
          select: {
            id: true,
            slug: true,
            title: true,
            active: true,
            project: { select: { id: true, slug: true } },
          },
        },
      },
    })
    const survey = surveySession?.survey
    const parsedSurvey = AllowedSurveySlugsSchema.safeParse(survey)
    // Only running Beteiligungen that want team mails (adminEmail) notify the Projektleitung.
    if (!survey?.active || !parsedSurvey.success) return
    if (!getConfigBySurveySlug(parsedSurvey.data.slug, "adminEmail")) return

    const projectLead = await findProjectLead(survey.project.id)
    if (!projectLead) return

    await (
      await surveyResponseSubmittedNotificationToProjectLead({
        projectLeadEmail: projectLead.email,
        projectName: shortTitle(survey.project.slug),
        surveyTitle: survey.title,
        surveyResponsePath: `/${survey.project.slug}/surveys/${survey.id}/responses?responseDetails=${surveyResponseId}`,
      })
    ).send()
  } catch (error) {
    console.error("Failed to notify the Projektleitung about a new Eingabe:", error)
  }
}
