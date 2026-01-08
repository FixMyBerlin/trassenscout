import { quote } from "@/src/core/components/text/quote"
import { RouteUrlObject } from "blitz"
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
  teamPath: RouteUrlObject | Route
}

export async function membershipCreatedNotificationToEditors(props: Props) {
  const introMarkdown = `
Guten Tag!

Diese E-Mail dient zur Information aller Personen mit der Rolle "Editor" im Projekt ${quote(
    props.projectName,
  )}.

# ${quote(props.invinteeName)} hat soeben die Einladung zur Mitarbeit angenommen und hat jetzt ${
    props.roleName
  }.

Das Projektteam kann unter ${mailUrl(props.teamPath)} eingesehen werden.
`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: props.user.email, Name: props.user.name }],
    Subject: `Trassenscout: Neues Teammitglied (${quote(props.projectName)})`,
    introMarkdown,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
