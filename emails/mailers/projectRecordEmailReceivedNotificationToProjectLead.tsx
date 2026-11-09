import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { emailTemplateKeys } from "@/src/shared/emailTemplates/registry"
import { addressNoreply } from "./utils/addresses"
import { sendMailWithoutPreview } from "./utils/sendMailWithoutPreview"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  projectLeadEmail: string
  projectName: string
  inboxEmailUrl: string
}

export async function projectRecordEmailReceivedNotificationToProjectLead(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.projectRecordEmailReceivedProjectLead,
    { projectName: props.projectName },
  )
  assertValidRenderedTemplate(renderedTemplate)

  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.projectLeadEmail }],
    template: renderedTemplate,
    ctaLink: props.inboxEmailUrl,
  })

  return {
    async send() {
      await sendMailWithoutPreview(message)
    },
  }
}
