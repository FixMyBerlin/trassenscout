import { quote } from "@/src/core/components/text/quote"
import { RouteUrlObject } from "blitz"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type Props = {
  user: { email: string; name: string }
  projectName: string
  inviterName: string
  path: RouteUrlObject
}

export async function invitationCreatedNotificationToEditors(props: Props) {
  const introMarkdown = `
Guten Tag!

Diese Mail dient zur Information aller Personen mit der Rolle "Editor" im Projekt ${quote(
    props.projectName,
  )}.

# ${quote(props.inviterName)} hat soeben eine:n neue:n Mitwirkende:n eingeladen.

Die Liste aller offenen Einladungen finden Sie unter ${mailUrl(props.path)}.
`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: props.user.email, Name: props.user.name }],
    Subject: "Trassenscout: Neues Teammitglied eingeladen",
    introMarkdown,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
