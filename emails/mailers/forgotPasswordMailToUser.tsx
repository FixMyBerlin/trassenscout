import { Routes } from "@blitzjs/next"
import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { MailjetMessage } from "./utils/types"

type props = {
  to: string
  token: string
}

export async function forgotPasswordMailToUser(props: props) {
  const text = `
Setzen Sie ihr Passwort zurück.
[Ein neues Passwort vergeben]( ${mailUrl(Routes.ResetPasswordPage({ token: props.token }))} )
`

  const message: MailjetMessage = {
    From: addressNoreply,
    To: [{ Email: props.to }],
    Subject: "Trassenscout: Setzen Sie ihr Passwort zurück",
    TextPart: text,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
