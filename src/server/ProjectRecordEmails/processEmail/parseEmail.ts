import { ParsedMail, simpleParser } from "mailparser"

export const parseEmail = async ({ rawEmailText }: { rawEmailText: string }) => {
  console.log("Parsing email to extract body and attachments...")

  try {
    const parsed = await simpleParser(rawEmailText)

    // Extract body - prefer text over html, or convert html to text
    let emailBody = ""
    if (parsed.text) {
      emailBody = parsed.text
    } else if (parsed.html) {
      // Simple HTML to text conversion - strip tags
      // For production, consider using a library like 'html-to-text'
      emailBody = parsed.html.toString().replace(/<[^>]*>/g, "")
    }

    const body = emailBody.trim()
    const attachments = extractEmailAttachments(parsed)

    console.log(`Extracted email body (${body.length} chars) and ${attachments.length} attachments`)

    return {
      body,
      attachments,
    }
  } catch (error) {
    console.error("Error parsing email:", error)
    // If parsing fails, use the original text as body
    console.log("Failed to parse email, using original text as body")
    return {
      body: rawEmailText,
      attachments: [],
    }
  }
}

export const extractEmailAttachments = (parsed: ParsedMail) => {
  const attachments = []

  if (parsed.attachments && parsed.attachments.length > 0) {
    for (const attachment of parsed.attachments) {
      // Filter out inline images and only keep actual file attachments
      if (!attachment.contentDisposition || attachment.contentDisposition === "attachment") {
        attachments.push({
          filename: attachment.filename || "unnamed",
          contentType: attachment.contentType,
          size: attachment.size,
          content: attachment.content,
        })
      }
    }
  }

  return attachments
}
