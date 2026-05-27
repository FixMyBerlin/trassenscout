import { footerTextMarkdown } from "@/emails/templats/footerTextMarkdown"
import { MarkdownMail } from "@/emails/templats/MarkdownMail"
import { signatureTextMarkdown } from "@/emails/templats/signatureTextMarkdown"
import { isDev, isTest } from "@/src/core/utils/isEnv"
import { guardedCreateSystemLogEntry } from "@/src/server/systemLogEntries/create/guardedCreateSystemLogEntry"
import { render } from "@react-email/render"
import { BrevoClient } from "@getbrevo/brevo"
import { formattedEmailAddress } from "./formattedEmailAddress"
import { getBrevoApiKeyForSending } from "./getBrevoApiKeyForSending"
import { Mail, MailMessage } from "./types"

/**
 * Send mail without preview in dev/test environments.
 * Use this for emails triggered by API routes to avoid webpack bundling issues with preview-email.
 */
export const sendMailWithoutPreview = async (message: Mail) => {
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
    console.log("📧 Email (dev/test mode - no preview):")
    console.log("From:", formattedEmailAddress(mailMessage.From))
    console.log("To:", mailMessage.To.map((to) => formattedEmailAddress(to)).join(";"))
    console.log("Subject:", mailMessage.Subject)
    console.log("Text:", mailMessage.TextPart)
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
