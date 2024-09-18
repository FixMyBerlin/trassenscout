import { quote } from "@/src/core/components/text/quote"
import { addressNoreply } from "./utils/addresses"
import { mailLink } from "./utils/mailLink"
import { sendMail } from "./utils/sendMail"
import { MailjetMessage } from "./utils/types"

type Props = {
  user: { email: string; name: string }
  projectName: string
  inviterName: string
  path: string
}

export async function invitationCreatedNotificationToEditors(props: Props) {
  const text = `
Guten Tag!

Diese Mail dient als Information an alle mit der Rolle "Editor" für das Projekt ${quote(
    props.projectName,
  )}.

Soeben hat ${quote(props.inviterName)} eine neue Mitwirkende:n eingeladen.

Die Liste aller offenen Einladungen finden Sie unter ${mailLink(props.path)}.
`

  const message: MailjetMessage = {
    From: addressNoreply,
    To: [{ Email: props.user.email, Name: props.user.name }],
    Subject: "Trassenscout: Neue Mitwirkende eingeladen",
    TextPart: text,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
