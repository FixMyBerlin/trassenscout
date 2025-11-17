import { footerTextMarkdown } from "@/emails/templats/footerTextMarkdown"
import { MarkdownMail } from "@/emails/templats/MarkdownMail"
import { signatureTextMarkdown } from "@/emails/templats/signatureTextMarkdown"
import { isDev, isTest } from "@/src/core/utils/isEnv"
import { guardedCreateSystemLogEntry } from "@/src/server/systemLogEntries/create/guardedCreateSystemLogEntry"
import { render } from "@react-email/components"
import Mailjet, { LibraryResponse, SendEmailV3_1 } from "node-mailjet"
import { addressDevteam } from "./addresses"
import { formattedEmailAddress } from "./formattedEmailAddress"
import { Mail, MailjetMessage } from "./types"

export const sendMail = async (message: Mail) => {
  // Add standard signiture and footer to TextPart only
  // (The HTMLPart puts this in separate layout groups.)
  const textPart = `
${message.introMarkdown}
${
  message.ctaLink && message.ctaText
    ? `

${message.ctaText}: ${message.ctaLink}

`
    : ""
}
${message.outroMarkdown ? message.outroMarkdown : ""}

${signatureTextMarkdown}

---
${footerTextMarkdown}
`

  const htmlPart = await render(<MarkdownMail {...message} />)

  const mailjetMessage: MailjetMessage = {
    From: message.From,
    To: message.To,
    Subject: message.Subject,
    TextPart: textPart,
    HTMLPart: htmlPart,
  }

  if (isTest || isDev) {
    const previewEmail = (await import("preview-email")).default
    await previewEmail({
      from: formattedEmailAddress(mailjetMessage.From),
      to: mailjetMessage.To.map((to) => formattedEmailAddress(to)).join(";"),
      subject: mailjetMessage.Subject,
      text: mailjetMessage.TextPart,
      html: mailjetMessage.HTMLPart,
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
        ...mailjetMessage,
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

  // Log message and message status
  for (const messageStatus of result.body.Messages) {
    await guardedCreateSystemLogEntry({
      apiKey: process.env.TS_API_KEY,
      logLevel: messageStatus.Status === "error" ? "ERROR" : "INFO",
      message: `SEND MAIL: ${mailjetMessage.Subject}`,
      // @ts-expect-error I think those types are fine…
      context:
        messageStatus.Status === "error"
          ? { CustomID: messageStatus.CustomID, errors: messageStatus.Errors }
          : { CustomID: messageStatus.CustomID, text: mailjetMessage.TextPart },
    })
  }
}
