import { AddressObject, ParsedMail, simpleParser } from "mailparser"

const getAddressText = (address: AddressObject | AddressObject[] | undefined) => {
  if (!address) return null
  if (Array.isArray(address)) {
    return address
      .map((entry) => entry.text)
      .filter(Boolean)
      .join(", ")
  }
  return address.text || null
}

export async function parseEmail({ rawEmailText }: { rawEmailText: string }) {
  console.log("Parsing email to extract body and attachments...")

  try {
    const parsed = await simpleParser(rawEmailText)

    let emailBody = ""
    if (parsed.text) {
      emailBody = parsed.text
    } else if (parsed.html) {
      emailBody = parsed.html.toString().replace(/<[^>]*>/g, "")
    }

    const body = emailBody.trim()
    const attachments = extractEmailAttachments(parsed)

    const from = parsed.from?.text || null
    const fromAddress = parsed.from?.value?.[0]?.address || null
    const to = getAddressText(parsed.to)
    const cc = getAddressText(parsed.cc)
    const subject = parsed.subject || null
    const date = parsed.date || null

    console.log(`Extracted email body (${body.length} chars) and ${attachments.length} attachments`)

    return {
      body,
      attachments,
      from,
      fromAddress,
      to,
      cc,
      subject,
      date,
    }
  } catch (error) {
    console.error("Error parsing email:", error)
    console.log("Failed to parse email, using original text as body")
    return {
      body: rawEmailText,
      attachments: [],
      from: null,
      fromAddress: null,
      to: null,
      cc: null,
      subject: null,
      date: null,
    }
  }
}

function extractEmailAttachments(parsed: ParsedMail) {
  const attachments = []

  for (const attachment of parsed.attachments) {
    attachments.push({
      filename: attachment.filename || "unnamed",
      contentType: attachment.contentType,
      size: attachment.size,
      content: attachment.content,
    })
  }

  return attachments
}
