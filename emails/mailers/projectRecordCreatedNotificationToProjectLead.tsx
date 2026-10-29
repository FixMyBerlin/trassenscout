import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { emailTemplateKeys } from "@/src/shared/emailTemplates/registry"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

type Props = {
  projectLeadEmail: string
  projectName: string
  recordTitle: string
  recordPath: string
}

export async function projectRecordCreatedNotificationToProjectLead(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.projectRecordCreatedProjectLead,
    {
      projectName: props.projectName,
      recordTitle: props.recordTitle,
    },
  )
  assertValidRenderedTemplate(renderedTemplate)

  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: props.projectLeadEmail }],
    template: renderedTemplate,
    ctaLink: mailUrl(props.recordPath),
  })

  return {
    async send() {
      await sendMail(message)
    },
  }
}
