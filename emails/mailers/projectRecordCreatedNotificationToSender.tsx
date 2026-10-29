import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { emailTemplateKeys } from "@/src/shared/emailTemplates/registry"
import { addressNoreply } from "./utils/addresses"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  senderEmail: string
  projectName: string
}

export async function projectRecordCreatedNotificationToSender(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.projectRecordCreatedSender,
    { projectName: props.projectName },
  )
  assertValidRenderedTemplate(renderedTemplate)

  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.senderEmail }],
    template: renderedTemplate,
  })

  return {
    async send() {
      await sendMail(message)
    },
  }
}
