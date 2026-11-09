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
  protocolMailboxEmail: string | null
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
      replyHintText: props.protocolMailboxEmail ? assignmentReplyHintText : "",
    },
  )
  assertValidRenderedTemplate(renderedTemplate)

  const message = buildTemplateMail({
    // Sent from the project's protocol mailbox so that replies land in its Posteingang.
    from: props.protocolMailboxEmail
      ? { Email: props.protocolMailboxEmail, Name: `Trassenscout Protokoll ${props.projectName}` }
      : addressNoreply,
    to: [{ Email: props.assigneeEmail }],
    template: renderedTemplate,
    ctaLink: mailUrl(props.recordPath),
  })

  return {
    async send() {
      try {
        await sendMail(message)
      } catch (error) {
        if (!props.protocolMailboxEmail) throw error
        // A provider that rejects the protocol mailbox as sender must not block the assignment.
        console.error("Sending from the protocol mailbox failed, retrying from noreply@:", error)
        await (
          await projectRecordAssignedNotificationToUser({ ...props, protocolMailboxEmail: null })
        ).send()
      }
    },
  }
}
