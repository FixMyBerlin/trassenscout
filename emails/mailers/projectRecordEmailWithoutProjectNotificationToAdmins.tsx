import { quote } from "@/src/core/components/text/quote"
import { addressNoreply } from "./utils/addresses"
import { sendMailWithoutPreview } from "./utils/sendMailWithoutPreview"
import { Mail } from "./utils/types"

type Props = {
  projectSlug?: string
  senderEmail: string
  emailSubject: string | null
  projectRecordEmailUrl: string
}

export async function projectRecordEmailWithoutProjectNotificationToAdmins(props: Props) {
  // Determine the reason for notification based on whether projectSlug was provided
  const noSlugProvided = !props.projectSlug
  const invalidSlug = props.projectSlug && props.projectSlug.length > 0

  let reasonText = ""
  let subjectSuffix = ""

  if (noSlugProvided) {
    reasonText =
      "Es wurde kein Subadressing genutzt, diese Email ist in der Inbox eingegangen. Die Email wurde im Trassenscout gespeichert und kann im Admin Interface einem Projekt zugeordnet und prozessiert werden."
    subjectSuffix = "Email ohne Subadressing eingegangen"
  } else if (invalidSlug && props.projectSlug) {
    reasonText = `Das Subadressing entspricht keinem im Trassenscout gespeicherten Projekt (${quote(props.projectSlug)}). Die Email wurde im Trassenscout gespeichert und kann im Admin Interface einem Projekt zugeordnet und prozessiert werden.`
    subjectSuffix = "Email mit ungültigem Subadressing eingegangen"
  }

  const introMarkdown = `
Hallo Trassenscout-Admin!

# Eine Email konnte keinem Projekt zugeordnet werden

${reasonText}

**Absenderadresse:** ${props.senderEmail}
**Betreff:** ${props.emailSubject || "(kein Betreff)"}
${invalidSlug ? `**Verwendetes Subadressing:** ${props.projectSlug}` : ""}

Bitte ordnen Sie die Email einem Projekt zu und prozessieren Sie sie im Admin Interface: ${props.projectRecordEmailUrl}
`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: process.env.ADMIN_EMAIL }],
    Subject: `[Admin] Trassenscout: ${subjectSuffix}`,
    introMarkdown,
    ctaLink: props.projectRecordEmailUrl,
    ctaText: "Email im Admin Interface anzeigen",
  }

  return {
    async send() {
      await sendMailWithoutPreview(message)
    },
  }
}
