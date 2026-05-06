import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { addressNoreply } from "./utils/addresses"
import { sendMailWithoutPreview } from "./utils/sendMailWithoutPreview"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

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
  actionItems.push("- Der Protokolleintrag genehmigt oder abgelehnt werden soll")

  // Generate subject based on the reason(s)
  let subjectSuffix = ""
  if (!props.isSenderApproved && !props.isAiEnabled) {
    subjectSuffix = "Email benötigt Admin-Prüfung"
  } else if (!props.isSenderApproved) {
    subjectSuffix = "Email von unbekannter Absenderadresse"
  } else if (!props.isAiEnabled) {
    subjectSuffix = "Email mit deaktivierten AI-Funktionen"
  }

  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.projectRecordNeedsReviewAdmin,
    {
      projectSlug: props.projectSlug,
      subjectSuffix,
      reviewReason: reasonText,
      senderEmail: props.senderEmail,
      emailSubject: props.emailSubject || "(kein Betreff)",
      actionItemsMarkdown: actionItems.join("\n"),
    },
  )
  assertValidRenderedTemplate(renderedTemplate)
  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: process.env.ADMIN_EMAIL }],
    template: renderedTemplate,
    ctaLink: props.projectRecordReviewUrl,
  })

  return {
    async send() {
      await sendMailWithoutPreview(message)
    },
  }
}
