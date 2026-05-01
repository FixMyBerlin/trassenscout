import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type props = {
  to: string
  token: string
}

export async function forgotPasswordMailToUser(props: props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(emailTemplateKeys.forgotPassword, {})

  if (!renderedTemplate.isValid) {
    throw new Error(
      `Invalid email template "${renderedTemplate.key}": ${renderedTemplate.unknownVariables.join(", ")}`,
    )
  }

  const ctaLink = mailUrl(`/auth/reset-password?token=${props.token}`)

  const message: Mail = renderedTemplate.rendered.ctaText
    ? {
        From: addressNoreply,
        To: [{ Email: props.to }],
        Subject: renderedTemplate.rendered.subject,
        introMarkdown: renderedTemplate.rendered.introMarkdown,
        outroMarkdown: renderedTemplate.rendered.outroMarkdown,
        ctaLink,
        ctaText: renderedTemplate.rendered.ctaText,
      }
    : {
        From: addressNoreply,
        To: [{ Email: props.to }],
        Subject: renderedTemplate.rendered.subject,
        introMarkdown: renderedTemplate.rendered.introMarkdown,
        outroMarkdown: renderedTemplate.rendered.outroMarkdown,
      }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
