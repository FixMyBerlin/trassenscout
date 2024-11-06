import { addressNoreply } from "./utils/addresses"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

type Props = {
  userMail: string
  userFirstname: string
  userLastname: string
  feedbackLocation?: { lng: number; lat: number }
  feedbackCategory: string
  feedbackText: string
  lineFromToName: string
}

export async function surveyEntryCreatedNotificationToUser(props: Props) {
  const introMarkdown = `
Guten Tag ${props.userFirstname} ${props.userLastname}!

Vielen Dank für Ihre Teilnahme!

# Hiermit bestätigen wir Ihnen den Eingang Ihres Beitrags mit folgenden Angaben:

* Eingangsdatum: ${new Date().toLocaleDateString("de-DE")}
* Kategorie: ${props.feedbackCategory}
* Ihre gewählte Verbindung im Netzentwurf: ${props.lineFromToName}

Ihr Hinweis:
${props.feedbackText
  .split("\n")
  .map((line) => `> ${line}`)
  .join("\n")}

${
  props.feedbackLocation
    ? `Ortsbezug des Beitrags (in OpenStreetMap): https://www.openstreetmap.org/?mlat=${props.feedbackLocation.lat}&mlon=${props.feedbackLocation.lng}&zoom=16`
    : ""
}

Hinweis: Beachten Sie, dass Sie für jeden eingereichten Hinweis eine separate E-Mail erhalten. Dies ist eine automatisiert versandte E-Mail, auf die Sie nicht antworten können.

Nach Abschluss der Beteiligung werden Ihre Hinweise fachlich geprüft und in die Abwägung zur Überarbeitung des Zielnetzentwurfs mit einbezogen.
`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: props.userMail, Name: `${props.userFirstname} ${props.userLastname}` }],
    Subject: "Beteiligung zum Radnetz Brandenburg: Ihr eingereichter Hinweis",
    introMarkdown,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
