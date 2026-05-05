import { emailTemplateKeys } from "@/src/server/emailTemplates/registry"
import { resolveAndRenderEmailTemplate } from "@/src/server/emailTemplates/render"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { assertValidRenderedTemplate, buildTemplateMail } from "./utils/templateMail"

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
  assertValidRenderedTemplate(renderedTemplate)

  const ctaLink = mailUrl(`/admin/memberships/new?userId=${props.userId}`)

  const message = buildTemplateMail({
    from: addressNoreply,
    to: [{ Email: process.env.ADMIN_EMAIL }],
    template: renderedTemplate,
    ctaLink,
  })

  return {
    async send() {
      await sendMail(message)
    },
  }
}
