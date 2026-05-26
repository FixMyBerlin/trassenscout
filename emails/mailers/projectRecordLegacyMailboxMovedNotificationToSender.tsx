import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { addressNoreply } from "./utils/addresses"
import { sendMailWithoutPreview } from "./utils/sendMailWithoutPreview"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  senderEmail: string
}

export async function projectRecordLegacyMailboxMovedNotificationToSender(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.projectRecordLegacyMailboxMovedSender,
    {},
  )
  assertValidRenderedTemplate(renderedTemplate)
  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.senderEmail }],
    template: renderedTemplate,
  })

  return {
    async send() {
      await sendMailWithoutPreview(message)
    },
  }
}
