import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { Route } from "next"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  user: { email: string; name: string }
  path: Route
}

export async function userCreatedNotificationToUser(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.userCreatedUserNotification,
    { userName: props.user.name },
  )
  assertValidRenderedTemplate(renderedTemplate)

  const ctaLink = mailUrl(props.path)

  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.user.email, Name: props.user.name }],
    template: renderedTemplate,
    ctaLink,
  })

  return {
    async send() {
      await sendMail(message)
    },
  }
}
