import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { emailTemplateKeys } from "@/src/shared/emailTemplates/registry"
import { addressNoreply } from "./utils/addresses"
import { sendMailWithoutPreview } from "./utils/sendMailWithoutPreview"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  projectSlug: string
  senderEmail: string
  emailSubject: string | null
  inboxEmailUrl: string
}

export async function projectRecordEmailReceivedNotificationToAdmins(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.projectRecordEmailReceivedAdmin,
    {
      projectSlug: props.projectSlug,
      senderEmail: props.senderEmail,
      emailSubject: props.emailSubject || "(kein Betreff)",
    },
  )
  assertValidRenderedTemplate(renderedTemplate)

  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: process.env.ADMIN_EMAIL }],
    template: renderedTemplate,
    ctaLink: props.inboxEmailUrl,
  })

  return {
    async send() {
      await sendMailWithoutPreview(message)
    },
  }
}
