import { quote } from "@/src/core/components/text/quote"
import { RouteUrlObject } from "blitz"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { MailjetMessage } from "./utils/types"

type Props = {
  userEmail: string
  projectName: string
  inviterName: string
  signupPath: RouteUrlObject
  loginPath: RouteUrlObject
}

export async function invitationCreatedMailToUser(props: Props) {
  const text = `
Guten Tag!

Sie wurden von ${props.inviterName} eingeladen am Projekt ${quote(props.projectName)} mitzuwirken.

Bitte Registieren Sie sich, um die Einladung anzunehmen.

[Einladung annehmen und Registrieren]( ${mailUrl(props.signupPath)} )

Wenn Sie schon einen Account unter diese E-Mail-Adresse haben, [melden Sie sich bitte damit an]( ${mailUrl(props.loginPath)} ), um die Einladung anzunehmen.
`

  const message: MailjetMessage = {
    From: addressNoreply,
    To: [{ Email: props.userEmail }],
    Subject: `Trassenscout: Einladung zum Projekt ${quote(props.projectName)}`,
    TextPart: text,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
