import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { Route } from "next"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type Props = {
  user: { email: string; name: string }
  projectName: string
  invinteeName: string
  roleName: string
  teamPath: Route
}

export async function membershipCreatedNotificationToEditors(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.membershipCreatedEditorsNotification,
    {
      projectName: props.projectName,
      inviteeName: props.invinteeName,
      roleName: props.roleName,
      teamUrl: mailUrl(props.teamPath),
    },
  )

  if (!renderedTemplate.isValid) {
    throw new Error(
      `Invalid email template "${renderedTemplate.key}": ${renderedTemplate.unknownVariables.join(", ")}`,
    )
  }

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: props.user.email, Name: props.user.name }],
    Subject: renderedTemplate.rendered.subject,
    introMarkdown: renderedTemplate.rendered.introMarkdown,
    outroMarkdown: renderedTemplate.rendered.outroMarkdown,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
