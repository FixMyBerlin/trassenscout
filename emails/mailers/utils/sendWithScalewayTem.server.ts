import { MailMessage } from "./types"

// Scaleway project "default", the same for staging and production
const temProjectId = "c9c72676-df76-4abe-bb06-c673b7eef2b5"
const temEmailsUrl = "https://api.scaleway.com/transactional-email/v1alpha1/regions/fr-par/emails"

type TemCreateEmailResponse = { emails: { id: string }[] }

export const sendWithScalewayTem = async (mailMessage: MailMessage) => {
  const response = await fetch(temEmailsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": process.env.SCALEWAY_TEM_SECRET_KEY?.trim() ?? "",
    },
    body: JSON.stringify({
      project_id: temProjectId,
      from: { email: mailMessage.From.Email, name: mailMessage.From.Name },
      to: mailMessage.To.map((recipient) => ({ email: recipient.Email, name: recipient.Name })),
      subject: mailMessage.Subject,
      text: mailMessage.TextPart,
      html: mailMessage.HTMLPart,
    }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    throw new Error(`Scaleway TEM responded ${response.status}: ${await response.text()}`)
  }

  const result = (await response.json()) as TemCreateEmailResponse
  return result.emails.map((email) => email.id)
}
