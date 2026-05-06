import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { Route } from "next"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  user: { email: string; name: string }
  projectName: string
  invinteeName: string
  roleName: string
  teamPath: Route
}

export async function membershipCreatedNotificationToEditors(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.membershipCreatedEditorsNotification,
    {
      projectName: props.projectName,
      inviteeName: props.invinteeName,
      roleName: props.roleName,
      teamUrl: mailUrl(props.teamPath),
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
