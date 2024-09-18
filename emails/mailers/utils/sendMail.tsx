import { footerTextMarkdown } from "@/emails/templats/footerTextMarkdown"
import { isDev, isTest } from "@/src/core/utils"
import { render } from "@react-email/components"
import Mailjet, { LibraryResponse, SendEmailV3_1 } from "node-mailjet"
import { MarkdownMail } from "../../templats/MarkdownMail"
import { addressDevteam } from "./addresses"
import { formattedEmailAddress } from "./formattedEmailAddress"
import { MailjetMessage } from "./types"

export const sendMail = async (message: MailjetMessage) => {
  // Add standard signiture to TextPart and HTMLPart
  message.TextPart = `
${message.TextPart}

Mit freundlichen Grüßen

i.A. das Team vom Trassenscout
`

  // When no HTML is provided, we reuse the text.
  // But we can provide custom HTML if needed.
  if (!message.HTMLPart) {
    message.HTMLPart = await render(<MarkdownMail markdown={message.TextPart} />)
  }

  // Add footer onyl to TextPart (because the HTMLPart has it's own footer)
  message.TextPart = `
${message.TextPart}

---
${footerTextMarkdown}
`

  if (isDev || isTest) {
    const previewEmail = (await import("preview-email")).default
    await previewEmail({
      from: formattedEmailAddress(message.From),
      to: message.To.map((to) => formattedEmailAddress(to)).join(";"),
      subject: message.Subject,
      text: message.TextPart,
      html: message.HTMLPart,
    })
    return
  }

  // === Only on Staging, Production ===

  // Add error reporting to the message
  const data = {
    Messages: [
      {
        // See https://dev.mailjet.com/email/template-language/sendapi/#templates-error-management
        TemplateErrorReporting: addressDevteam,
        ...message,
      },
    ],
  }

  // Send message
  const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_APIKEY_PUBLIC,
    process.env.MAILJET_APIKEY_PRIVATE,
  )
  const result: LibraryResponse<SendEmailV3_1.Response> = await mailjet
    .post("send", { version: "v3.1" })
    .request(data)

  // Log status
  const messagesStatus = result.body.Messages
  for (const messageStatus of messagesStatus) {
    console.log("Mailjet email send", message.Subject, messageStatus.Status)
    if (messageStatus.Errors.length) {
      console.error("Error when sending a Mailjet message", message.Subject, messageStatus)
    }
  }
}
