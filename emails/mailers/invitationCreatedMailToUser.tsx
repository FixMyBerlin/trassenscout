import { quote } from "@/src/core/components/text/quote"
import { Route } from "next"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type Props = {
  userEmail: string
  projectName: string
  inviterName: string
  signupPath: Route
  loginPath: Route
}

export async function invitationCreatedMailToUser(props: Props) {
  const introMarkdown = `
Guten Tag!

# ${props.inviterName} hat Sie soeben eingeladen, am Projekt ${quote(props.projectName)} mitzuwirken.

Bitte registieren Sie sich, um die Einladung anzunehmen.`

  const outroMarkdown = `
Falls Sie schon einen Trassenscout-Account unter dieser E-Mail-Adresse besitzen, [melden Sie sich bitte damit an]( ${mailUrl(props.loginPath)} ), um die Einladung anzunehmen.
`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: props.userEmail }],
    Subject: `Trassenscout: Ihre Einladung zum Projekt ${quote(props.projectName)}`,
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
