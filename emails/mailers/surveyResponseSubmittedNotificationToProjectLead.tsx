import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { emailTemplateKeys } from "@/src/shared/emailTemplates/registry"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  projectLeadEmail: string
  projectName: string
  surveyTitle: string
  surveyResponsePath: string
}

export async function surveyResponseSubmittedNotificationToProjectLead(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.surveyResponseSubmittedProjectLead,
    {
      projectName: props.projectName,
      surveyTitle: props.surveyTitle,
    },
  )
  assertValidRenderedTemplate(renderedTemplate)

  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.projectLeadEmail }],
    template: renderedTemplate,
    ctaLink: mailUrl(props.surveyResponsePath),
  })

  return {
    async send() {
      await sendMail(message)
    },
  }
}
