import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  to: string
  token: string
}

export async function forgotPasswordMailToUser(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(emailTemplateKeys.forgotPassword, {})
  assertValidRenderedTemplate(renderedTemplate)

  const ctaLink = mailUrl(`/auth/reset-password?token=${props.token}`)
  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.to }],
    template: renderedTemplate,
    ctaLink,
  })

  return {
    async send() {
      await sendMail(message)
    },
  }
}
