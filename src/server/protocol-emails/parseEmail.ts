import { ParsedMail, simpleParser } from "mailparser"

export interface ParsedEmailAttachment {
  filename: string
  contentType: string
  size: number
  content: Buffer
}

export interface ParsedEmailResult {
  body: string
  attachments: ParsedEmailAttachment[]
}

/**
 * Parses a raw MIME email string and extracts the body and attachments
 * @param rawEmail - The raw MIME email string
 * @returns An object containing the plain text body and array of attachments
 */
export async function parseEmail(rawEmail: string): Promise<ParsedEmailResult> {
  const parsed: ParsedMail = await simpleParser(rawEmail)

  // Extract body - prefer text over html, or convert html to text
  let body = ""
  if (parsed.text) {
    body = parsed.text
  } else if (parsed.html) {
    // Simple HTML to text conversion - strip tags
    // For production, consider using a library like 'html-to-text'
    body = parsed.html.toString().replace(/<[^>]*>/g, "")
  }

  // Extract attachments
  const attachments: ParsedEmailAttachment[] = []
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

  return {
    body: body.trim(),
    attachments,
  }
}
