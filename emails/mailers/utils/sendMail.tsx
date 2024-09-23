import { footerTextMarkdown } from "@/emails/templats/footerTextMarkdown"
import { MarkdownMail } from "@/emails/templats/MarkdownMail"
import { signatureTextMarkdown } from "@/emails/templats/signatureTextMarkdown"
import { isDev, isTest } from "@/src/core/utils"
import { internalCreateLogEntry } from "@/src/logEntries/internalCeateLogEntry"
import { render } from "@react-email/components"
import Mailjet, { LibraryResponse, SendEmailV3_1 } from "node-mailjet"
import { addressDevteam } from "./addresses"
import { formattedEmailAddress } from "./formattedEmailAddress"
import { MailjetMessage } from "./types"

export const sendMail = async (message: MailjetMessage) => {
  // When no HTML is provided, we reuse the text.
  // But we can provide custom HTML if needed.
  if (!message.HTMLPart) {
    message.HTMLPart = await render(<MarkdownMail markdown={message.TextPart} />)
  }

  // Add standard signiture and footer to TextPart only
  // (The HTMLPart puts this in separate layout groups.)
  message.TextPart = `
${message.TextPart}

${signatureTextMarkdown}

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
        // See Callout at https://dev.mailjet.com/email/guides/send-api-v31/
        // Error `"TemplateLanguage" is not set while "TemplateErrorReporting" or "TemplateErrorDeliver" properties are.`
        TemplateLanguage: true,
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
  for (const messageStatus of result.body.Messages) {
    await internalCreateLogEntry({
      apiKey: process.env.TS_API_KEY,
      logLevel: messageStatus.Status === "error" ? "ERROR" : "INFO",
      message: `SEND MAIL: ${message.Subject}`,
      // @ts-expect-error I think those types are fine…
      context:
        messageStatus.Status === "error"
          ? { CustomID: messageStatus.CustomID, errors: messageStatus.Errors }
          : { CustomID: messageStatus.CustomID, text: message.TextPart },
    })
  }
}
