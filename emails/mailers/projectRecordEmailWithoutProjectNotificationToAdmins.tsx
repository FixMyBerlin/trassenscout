import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { addressNoreply } from "./utils/addresses"
import { sendMailWithoutPreview } from "./utils/sendMailWithoutPreview"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  projectSlug?: string
  senderEmail: string
  emailSubject: string | null
  projectRecordEmailUrl: string
}

export async function projectRecordEmailWithoutProjectNotificationToAdmins(props: Props) {
  // Determine the reason for notification based on whether projectSlug was provided
  const hasSubaddressSlug = Boolean(props.projectSlug && props.projectSlug.length > 0)
  const noSubaddressProvided = !hasSubaddressSlug

  let reasonText = ""
  let subjectSuffix = ""

  if (noSubaddressProvided) {
    reasonText =
      "Es wurde kein Subadressing genutzt, diese Email ist in der Inbox eingegangen. Die Email wurde im Trassenscout gespeichert und kann im Admin Interface einem Projekt zugeordnet und prozessiert werden."
    subjectSuffix = "Email ohne Subadressing eingegangen"
  } else if (hasSubaddressSlug && props.projectSlug) {
    reasonText = `Das Subadressing entspricht keinem im Trassenscout gespeicherten Projekt (${props.projectSlug}). Die Email wurde im Trassenscout gespeichert und kann im Admin Interface einem Projekt zugeordnet und prozessiert werden.`
    subjectSuffix = "Email mit ungültigem Subadressing eingegangen"
  }

  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.projectRecordEmailWithoutProjectAdmin,
    {
      subjectSuffix,
      reasonText,
      senderEmail: props.senderEmail,
      emailSubject: props.emailSubject || "(kein Betreff)",
      usedSubaddressLine: hasSubaddressSlug && props.projectSlug
        ? `**Verwendetes Subadressing:** ${props.projectSlug}`
        : "",
    },
  )
  assertValidRenderedTemplate(renderedTemplate)
  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: process.env.ADMIN_EMAIL }],
    template: renderedTemplate,
    ctaLink: props.projectRecordEmailUrl,
  })

  return {
    async send() {
      await sendMailWithoutPreview(message)
    },
  }
}
