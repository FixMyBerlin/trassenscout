import { quote } from "@/src/core/components/text/quote"
import { addressNoreply } from "./utils/addresses"
import { sendMailWithoutPreview } from "./utils/sendMailWithoutPreview"
import { Mail } from "./utils/types"

type Props = {
  projectSlug: string
  senderEmail: string
  emailSubject: string | null
  projectRecordReviewUrl: string
  isAiEnabled: boolean
  isSenderApproved: boolean
}

export async function projectRecordNeedsReviewNotificationToAdmins(props: Props) {
  // Determine the reason(s) for notification
  const reasons: string[] = []
  if (!props.isSenderApproved) {
    reasons.push(
      "die Absenderadresse nicht als Teammitglied oder Kontakt im Projekt hinterlegt ist",
    )
  }
  if (!props.isAiEnabled) {
    reasons.push("AI-Funktionen für dieses Projekt deaktiviert sind")
  }

  const reasonText = reasons.length > 1 ? reasons.join(" und ") : reasons[0]

  const actionItems: string[] = []
  if (!props.isSenderApproved) {
    actionItems.push("- Die Absenderadresse als Kontakt zum Projekt hinzugefügt werden soll")
  }
  if (!props.isAiEnabled) {
    actionItems.push("- Die AI-generierten Inhalte überprüft und ggf. korrigiert werden müssen")
  }
  actionItems.push("- Das Projektprotokoll genehmigt oder abgelehnt werden soll")

  const introMarkdown = `
Hallo Trassenscout-Admin!

# Eine Email benötigt Admin-Prüfung im Projekt ${quote(props.projectSlug)}

Die Email wurde automatisch als Projektprotokoll erfasst, benötigt jedoch eine Admin-Prüfung, da ${reasonText}.

**Absenderadresse:** ${props.senderEmail}
**Betreff:** ${props.emailSubject || "(kein Betreff)"}

Bitte prüfen Sie das erstellte Projektprotokoll und entscheiden Sie, ob:
${actionItems.join("\n")}

Das Projektprotokoll können Sie unter ${props.projectRecordReviewUrl} einsehen und bearbeiten.
`

  // Generate subject based on the reason(s)
  let subjectSuffix = ""
  if (!props.isSenderApproved && !props.isAiEnabled) {
    subjectSuffix = "Email benötigt Admin-Prüfung"
  } else if (!props.isSenderApproved) {
    subjectSuffix = "Email von unbekannter Absenderadresse"
  } else if (!props.isAiEnabled) {
    subjectSuffix = "Email mit deaktivierten AI-Funktionen"
  }

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: process.env.ADMIN_EMAIL }],
    Subject: `[Admin] Trassenscout: ${subjectSuffix} in Projekt ${quote(props.projectSlug)}`,
    introMarkdown,
    ctaLink: props.projectRecordReviewUrl,
    ctaText: "Projektprotokoll prüfen",
  }

  return {
    async send() {
      await sendMailWithoutPreview(message)
    },
  }
}
