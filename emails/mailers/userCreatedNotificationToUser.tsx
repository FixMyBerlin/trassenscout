import { quote } from "@/src/core/components/text/quote"
import { RouteUrlObject } from "blitz"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { MailjetMessage } from "./utils/types"

type Props = {
  user: { email: string; name: string }
  projectName: string
  path: RouteUrlObject
}

export async function userCreatedNotificationToUser(props: Props) {
  const text = `
Guten Tag ${props.user.name}!

Diese Mail dient als Information, dass Sie soeben einen Account für das Projekt ${quote(
    props.projectName,
  )} im Trassenscout erstellt haben.

[ Trassenscout öffnen ](${mailUrl(props.path)})
`

  const message: MailjetMessage = {
    From: addressNoreply,
    To: [{ Email: props.user.email, Name: props.user.name }],
    Subject: "Trassenscout: Account aktiviert",
    TextPart: text,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
