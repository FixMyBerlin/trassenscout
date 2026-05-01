import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type Props = {
  userMail: string
  userId: number
  userName: string | null
  userMembershipCount: number
}

export async function userCreatedNotificationToAdmin(props: Props) {
  const renderedTemplate = await resolveAndRenderEmailTemplate(
    emailTemplateKeys.userCreatedAdminNotification,
    {
      userName: props.userName || "(kein Name)",
      userMail: props.userMail,
      membershipStatusText:
        props.userMembershipCount > 0
          ? `Es sind bereits ${props.userMembershipCount} Mitgliedschafte(n) eingetragen (Einladungsprozess)`
          : "Es sind noch keine Mitgliedschaften vorhanden",
    },
  )

  if (!renderedTemplate.isValid) {
    throw new Error(
      `Invalid email template "${renderedTemplate.key}": ${renderedTemplate.unknownVariables.join(", ")}`,
    )
  }

  const ctaLink = mailUrl(`/admin/memberships/new?userId=${props.userId}`)

  const message: Mail = renderedTemplate.rendered.ctaText
    ? {
        From: addressNoreply,
        To: [{ Email: process.env.ADMIN_EMAIL }],
        Subject: renderedTemplate.rendered.subject,
        introMarkdown: renderedTemplate.rendered.introMarkdown,
        outroMarkdown: renderedTemplate.rendered.outroMarkdown,
        ctaLink,
        ctaText: renderedTemplate.rendered.ctaText,
      }
    : {
        From: addressNoreply,
        To: [{ Email: process.env.ADMIN_EMAIL }],
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
