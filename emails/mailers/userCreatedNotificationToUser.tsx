import { RouteUrlObject } from "blitz"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type Props = {
  user: { email: string; name: string }
  path: RouteUrlObject
}

export async function userCreatedNotificationToUser(props: Props) {
  const introMarkdown = `
Guten Tag ${props.user.name}!

Diese Mail dient als Information, dass Sie soeben einen Account im Trassenscout erstellt haben.
`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: props.user.email, Name: props.user.name }],
    Subject: "Trassenscout: Account aktiviert",
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
