import { BrevoClient } from "@getbrevo/brevo"
import { render } from "@react-email/render"
import { footerTextMarkdown } from "@/emails/templats/footerTextMarkdown"
import { MarkdownMail } from "@/emails/templats/MarkdownMail"
import { signatureTextMarkdown } from "@/emails/templats/signatureTextMarkdown"
import { isDev, isTest } from "@/src/components/core/utils/isEnv"
import { guardedCreateSystemLogEntry } from "@/src/server/systemLogEntries/create/guardedCreateSystemLogEntry"
import { formattedEmailAddress } from "./formattedEmailAddress"
import { getBrevoApiKeyForSending } from "./getBrevoApiKeyForSending"
import { Mail, MailMessage } from "./types"

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

  const mailMessage: MailMessage = {
    From: message.From,
    To: message.To,
    Subject: message.Subject,
    TextPart: textPart,
    HTMLPart: htmlPart,
  }

  if (isTest || isDev) {
    const previewEmail = (await import("preview-email")).default
    await previewEmail({
      from: formattedEmailAddress(mailMessage.From),
      to: mailMessage.To.map((to) => formattedEmailAddress(to)).join(";"),
      subject: mailMessage.Subject,
      text: mailMessage.TextPart,
      html: mailMessage.HTMLPart,
    })
    return
  }

  // === Only on Staging, Production ===
  const brevo = new BrevoClient({ apiKey: getBrevoApiKeyForSending() })

  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        email: mailMessage.From.Email,
        name: mailMessage.From.Name,
      },
      to: mailMessage.To.map((recipient) => ({
        email: recipient.Email,
        name: recipient.Name,
      })),
      subject: mailMessage.Subject,
      textContent: mailMessage.TextPart,
      htmlContent: mailMessage.HTMLPart,
    })

    await guardedCreateSystemLogEntry({
      apiKey: process.env.TS_API_KEY,
      logLevel: "INFO",
      message: `SEND MAIL: ${mailMessage.Subject}`,
      context: { messageId: result.messageId, text: mailMessage.TextPart },
    })
  } catch (error) {
    await guardedCreateSystemLogEntry({
      apiKey: process.env.TS_API_KEY,
      logLevel: "ERROR",
      message: `SEND MAIL: ${mailMessage.Subject}`,
      context: {
        error: error instanceof Error ? error.message : "unknown error",
        text: mailMessage.TextPart,
      },
    })
    throw error
  }
}
