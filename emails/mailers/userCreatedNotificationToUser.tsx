import { Route } from "next"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type Props = {
  user: { email: string; name: string }
  path: Route
}

export async function userCreatedNotificationToUser(props: Props) {
  const introMarkdown = `
Guten Tag ${props.user.name}!

Herzlich Willkommen im Trassenscout! Diese E-Mail dient zur Information, dass Sie soeben erfolgreich einen Account erstellt haben. 
`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: props.user.email, Name: props.user.name }],
    Subject: "Trassenscout: Account erstellt",
    introMarkdown,
    ctaLink: mailUrl(props.path),
    ctaText: "Trassenscout öffnen",
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
