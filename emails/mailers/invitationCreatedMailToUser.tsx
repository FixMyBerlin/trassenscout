import { quote } from "@/src/core/components/text/quote"
import { addressNoreply } from "./utils/addresses"
import { mailLink } from "./utils/mailLink"
import { sendMail } from "./utils/sendMail"
import { MailjetMessage } from "./utils/types"

type Props = {
  userEmail: string
  projectName: string
  inviterName: string
  signupPath: string
  loginPath: string
}

export async function invitationCreatedMailToUser(props: Props) {
  const text = `
Guten Tag!

Sie wurden von ${props.inviterName} eingeladen am Projekt ${quote(props.projectName)} mitzuwirken.

Bitte Registieren Sie sich, um die Einladung anzunehmen.

[Einladung annehmen und Registrieren]( ${mailLink(props.signupPath)} )

Wenn Sie schon einen Account unter diese E-Mail-Adresse haben, [melden Sie sich bitte damit an]( ${mailLink(props.loginPath)} ), um die Einladung anzunehmen.
`

  const message: MailjetMessage = {
    From: addressNoreply,
    To: [{ Email: props.userEmail }],
    Subject: "Trassenscout: Neue Mitwirkende eingeladen",
    TextPart: text,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
