import Mailjet from "node-mailjet"
import previewEmail from "preview-email"

type ResetPasswordMailer = {
  to: string
  token: string
}

export function forgotPasswordMailer({ to, token }: ResetPasswordMailer) {
  // In production, set APP_ORIGIN to your production server origin
  const origin = process.env.APP_ORIGIN || process.env.BLITZ_DEV_SERVER_ORIGIN
  const resetUrl = `${origin}/auth/reset-password?token=${token}`

  // mailjet format
  const msg = {
    From: { Email: "<info@fixmycity.de>", Name: "Trassenscout" },
    To: [{ Email: to }],
    Subject: "Setzen Sie ihr Passwort zurück",
    TextPart: `
      Setzen Sie ihr Passwort zurück.\n
      Ein neues Passwort vergeben: ${resetUrl},
    `,
    HTMLPart: `
      <h1>Setzen Sie ihr Passwort zurück.</h1>
      <a href="${resetUrl}">
        Ein neues Passwort vergeben
      </a>
    `,
  }

  return {
    async send() {
      if (process.env.NODE_ENV === "production") {
        const mailjet = Mailjet.apiConnect(
          // @ts-ignore
          process.env.MAILJET_APIKEY_PUBLIC,
          process.env.MAILJET_APIKEY_PRIVATE
        )
        const request = mailjet.post("send", { version: "v3.1" }).request({ Messages: [msg] })
        request
          .then((result) => {
            console.log(result.body)
          })
          .catch((err) => {
            console.error(err.statusCode)
          })
      } else {
        // Preview email in the browser
        var { From, To, Subject, TextPart, HTMLPart } = msg
        await previewEmail({
          from: `${From.Name} <${From.Email}>`,
          // @ts-ignore
          to: `${To[0]?.Name || ""} <${To[0].Email}>`,
          subject: Subject,
          text: TextPart,
          html: HTMLPart,
        })
      }
    },
  }
}
