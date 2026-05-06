import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { Route } from "next"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  assigneeEmail: string
  assigneeName: string
  actorName: string
  recordTitle: string
  projectName: string
  recordPath: Route
}

export async function projectRecordAssignedNotificationToUser(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.projectRecordAssignedUser,
    {
      assigneeName: props.assigneeName,
      actorName: props.actorName,
      recordTitle: props.recordTitle,
      projectName: props.projectName,
    },
  )
  assertValidRenderedTemplate(renderedTemplate)

  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.assigneeEmail }],
    template: renderedTemplate,
    ctaLink: mailUrl(props.recordPath),
  })

  return {
    async send() {
      await sendMail(message)
    },
  }
}
