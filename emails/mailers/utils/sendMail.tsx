import { render } from "@react-email/render"
import { footerTextMarkdown } from "@/emails/templats/footerTextMarkdown"
import { MarkdownMail } from "@/emails/templats/MarkdownMail"
import { isDev, isPlaywright, isTest } from "@/src/components/core/utils/isEnv"
import { guardedCreateSystemLogEntry } from "@/src/server/systemLogEntries/create/guardedCreateSystemLogEntry"
import { formattedEmailAddress } from "./formattedEmailAddress"
import { sendWithScalewayTem } from "./sendWithScalewayTem.server"
import { Mail, MailMessage } from "./types"

export const sendMail = async (message: Mail) => {
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
    const isE2e = isPlaywright
    await previewEmail(
      {
        from: formattedEmailAddress(mailMessage.From),
        to: mailMessage.To.map((to) => formattedEmailAddress(to)).join(";"),
        subject: mailMessage.Subject,
        text: mailMessage.TextPart,
        html: mailMessage.HTMLPart,
      },
      { open: isE2e ? false : { wait: false }, openSimulator: false },
    )
    return
  }

  // === Only on Staging, Production ===
  try {
    const temEmailIds = await sendWithScalewayTem(mailMessage)

    await guardedCreateSystemLogEntry({
      apiKey: process.env.TS_API_KEY,
      logLevel: "INFO",
      message: `SEND MAIL: ${mailMessage.Subject}`,
      context: { temEmailIds, text: mailMessage.TextPart },
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
