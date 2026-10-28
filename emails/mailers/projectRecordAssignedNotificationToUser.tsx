import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { assignmentReplyHintText, emailTemplateKeys } from "@/src/shared/emailTemplates/registry"
import { toTemplateText } from "@/src/shared/templates/templateText"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  assigneeEmail: string
  assigneeName: string
  actorName: string
  recordTitle: string
  recordText: string | null
  projectName: string
  recordPath: string
  replyToEmail: string | null
}

export async function projectRecordAssignedNotificationToUser(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.projectRecordAssignedUser,
    {
      assigneeName: props.assigneeName,
      actorName: props.actorName,
      recordTitle: props.recordTitle,
      recordText: toTemplateText(props.recordText),
      projectName: props.projectName,
      replyHintText: props.replyToEmail ? assignmentReplyHintText : "",
    },
  )
  assertValidRenderedTemplate(renderedTemplate)

  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.assigneeEmail }],
    replyTo: props.replyToEmail
      ? { Email: props.replyToEmail, Name: `Trassenscout Protokoll ${props.projectName}` }
      : undefined,
    template: renderedTemplate,
    ctaLink: mailUrl(props.recordPath),
  })

  return {
    async send() {
      await sendMail(message)
    },
  }
}
