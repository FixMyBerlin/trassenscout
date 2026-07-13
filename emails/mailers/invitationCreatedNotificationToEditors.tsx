import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { emailTemplateKeys } from "@/src/shared/emailTemplates/registry"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  user: { email: string; name: string }
  projectName: string
  inviterName: string
  path: string
}

export async function invitationCreatedNotificationToEditors(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.invitationCreatedEditorsNotification,
    {
      projectName: props.projectName,
      inviterName: props.inviterName,
      invitesUrl: mailUrl(props.path),
    },
  )
  assertValidRenderedTemplate(renderedTemplate)
  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.user.email, Name: props.user.name }],
    template: renderedTemplate,
  })

  return {
    async send() {
      await sendMail(message)
    },
  }
}
