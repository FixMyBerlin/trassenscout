import { quote } from "@/src/core/components/text/quote"
import { addressNoreply } from "./utils/addresses"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type Props = {
  projectSlug: string
  senderEmail: string
  emailSubject: string | null
  projectRecordReviewUrl: string
}

export async function unapprovedSenderNotificationToAdmins(props: Props) {
  const introMarkdown = `
Hallo Trassenscout-Admin!

# Eine Email von einer unbekannten Absenderadresse wurde im Projekt ${quote(
    props.projectSlug,
  )} empfangen.

Die Email wurde automatisch als Projektprotokoll erfasst, benötigt jedoch eine Admin-Prüfung, da die Absenderadresse nicht als Teammitglied oder Kontakt im Projekt hinterlegt ist.

**Absenderadresse:** ${props.senderEmail}
**Betreff:** ${props.emailSubject || "(kein Betreff)"}

Bitte prüfen Sie das erstellte Projektprotokoll und entscheiden Sie, ob:
- Die Absenderadresse als Kontakt zum Projekt hinzugefügt werden soll
- Das Projektprotokoll genehmigt oder abgelehnt werden soll

Das Projektprotokoll können Sie unter ${props.projectRecordReviewUrl} einsehen und bearbeiten.
`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: process.env.ADMIN_EMAIL }],
    Subject: `[Admin] Trassenscout: Email von unbekannter Absenderadresse in Projekt ${quote(props.projectSlug)}`,
    introMarkdown,
    ctaLink: props.projectRecordReviewUrl,
    ctaText: "Projektprotokoll prüfen",
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
