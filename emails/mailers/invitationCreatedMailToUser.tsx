import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { Route } from "next"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  userEmail: string
  projectName: string
  inviterName: string
  signupPath: Route
  loginPath: Route
}

export async function invitationCreatedMailToUser(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.invitationCreatedUser,
    {
      inviterName: props.inviterName,
      projectName: props.projectName,
      loginUrl: mailUrl(props.loginPath),
    },
  )
  assertValidRenderedTemplate(renderedTemplate)

  const ctaLink = mailUrl(props.signupPath)

  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.userEmail }],
    template: renderedTemplate,
    ctaLink,
  })

  return {
    async send() {
      await sendMail(message)
    },
  }
}
