import { addressNoreply } from "./utils/addresses"
import { mailUrl } from "./utils/mailUrl"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type props = {
  to: string
  token: string
}

export async function forgotPasswordMailToUser(props: props) {
  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: props.to }],
    Subject: "Trassenscout: Setzen Sie ihr Passwort zurück",
    introMarkdown: "# Setzen Sie ihr Passwort zurück.",
    ctaLink: mailUrl(`/auth/forgot-password?token=${props.token}`),
    ctaText: "Ein neues Passwort vergeben",
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
