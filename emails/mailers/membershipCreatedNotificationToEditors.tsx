import { quote } from "@/src/core/components/text/quote"
import { addressNoreply } from "./utils/addresses"
import { mailLink } from "./utils/mailLink"
import { sendMail } from "./utils/sendMail"
import { MailjetMessage } from "./utils/types"

type Props = {
  user: { email: string; name: string }
  projectName: string
  invinteeName: string
  roleName: string
  teamPath: string
}

export async function membershipCreatedNotificationToEditors(props: Props) {
  const text = `
Guten Tag!

Diese Mail dient als Information an alle mit der Rolle "Editor" für das Projekt ${quote(
    props.projectName,
  )}.

Soeben hat ${quote(props.invinteeName)} die Einladung zur Mitarbeit angenommen und hat jetzt ${
    props.roleName
  }.

Das Projektteam kann unter ${mailLink(props.teamPath)} eingesehen werden.
`

  const message: MailjetMessage = {
    From: addressNoreply,
    To: [{ Email: props.user.email, Name: props.user.name }],
    Subject: `Trassenscout: Neue Mitwirkende (${quote(props.projectName)})`,
    TextPart: text,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
