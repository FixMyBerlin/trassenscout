import { getPrdOrStgDomain } from "@/src/core/components/links/getDomain"
import Mailjet from "node-mailjet"
import previewEmail from "preview-email"

type UserCreationMailer = {
  userMail: string
  userId: number
  userFirstname: string | null
  userLastname: string | null
}

export function userCreationMailer({
  userMail,
  userId,
  userFirstname,
  userLastname,
}: UserCreationMailer) {
  const origin = getPrdOrStgDomain()

  // mailjet format
  const msg = {
    From: { Email: "<noreply@trassenscout.de>", Name: "Trassenscout" },
    To: [{ Email: process.env.ADMIN_EMAIL }],
    Subject: "User hat sich registriert",
    TextPart: `
    Liebes Trassenscout-Team,

    ein neuer Nutzer-Account wurde erstellt, bitte prüfen und einem Projekt zuordnen:
    Name: ${userFirstname} ${userLastname}
    E-Mail: ${userMail}

    Hier können die Rechte vergeben werden: ${origin}/admin/memberships

    Viele Grüße
    Dein Trassenscout-Nachrichtendienst
    `,
    HTMLPart: `
    <p>Liebes Trassenscout-Team,</p>

    <p>ein neuer Nutzer-Account wurde erstellt, bitte prüfen und einem Projekt zuordnen:</p>
    <ul>
    <li>Name: ${userFirstname} ${userLastname}</li>
    <li>E-Mail: ${userMail}</li>
    </ul>
    <p>Hier können die Rechte vergeben werden: <a href="${origin}/admin/memberships">Zugriffsrechte-Verwaltung</a></p>

    <p>Viele Grüße<br/>
    Dein Trassenscout-Nachrichtendienst</p>
    `,
  }

  return {
    async send() {
      if (process.env.NODE_ENV === "production") {
        const mailjet = Mailjet.apiConnect(
          // @ts-ignore
          process.env.MAILJET_APIKEY_PUBLIC,
          process.env.MAILJET_APIKEY_PRIVATE,
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
