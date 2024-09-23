import { quote } from "@/src/core/components/text/quote"
import { RouteUrlObject } from "blitz"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type Props = {
  userEmail: string
  projectName: string
  inviterName: string
  signupPath: RouteUrlObject
  loginPath: RouteUrlObject
}

export async function invitationCreatedMailToUser(props: Props) {
  const introMarkdown = `
Guten Tag!

# Sie wurden eingeladen am Projekt ${quote(props.projectName)} mitzuwirken

Diese Einladung wurde von ${props.inviterName} verschickt.

Bitte Registieren Sie sich, um die Einladung anzunehmen.`

  const outroMarkdown = `
Wenn Sie schon einen Account unter diese E-Mail-Adresse haben, [melden Sie sich bitte damit an]( ${mailUrl(props.loginPath)} ), um die Einladung anzunehmen.
`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: props.userEmail }],
    Subject: `Trassenscout: Einladung zum Projekt ${quote(props.projectName)}`,
    introMarkdown,
    ctaLink: mailUrl(props.signupPath),
    ctaText: "Einladung annehmen und registrieren",
    outroMarkdown,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
