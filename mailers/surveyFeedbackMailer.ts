import { getPrdOrStgDomain } from "@/src/core/components/links/getDomain"
import Mailjet from "node-mailjet"
import previewEmail from "preview-email"

type SurveyFeedbackMailer = {
  userMail: string
  userFirstname: string
  userLastname: string
  feedbackLocation?: { lng: number; lat: number }
  feedbackCategory: string
  feedbackText: string
  lineFromToName: string
}

export function surveyFeedbackMailer({
  userMail,
  userFirstname,
  userLastname,
  feedbackLocation,
  feedbackCategory,
  feedbackText,
  lineFromToName,
}: SurveyFeedbackMailer) {
  const origin = getPrdOrStgDomain()
  // mailjet format
  const msg = {
    From: { Email: "<noreply@trassenscout.de>", Name: "Trassenscout" },
    To: [{ Email: userMail }],
    Subject: "Beteiligung zum Radnetz Brandenburg: Ihr eingereichter Hinweis",
    TextPart: `
    Guten Tag, ${userFirstname} ${userLastname},

    vielen Dank für Ihre Teilnahme! Hiermit bestätigen wir Ihnen den Eingang Ihres Beitrags mit folgenden Angaben:

    Eingangsdatum: ${new Date().toLocaleDateString("de-DE")}

    Kategorie: ${feedbackCategory}

    Ihre gewählte Verbindung im Netzentwurf: ${lineFromToName}

    Ihr Hinweis:
    ${feedbackText}

    ${
      feedbackLocation
        ? `Ortsbezug des Beitrags (in OpenStreetMap): https://www.openstreetmap.org/?mlat=${feedbackLocation.lat}&mlon=${feedbackLocation.lng}&zoom=16`
        : ""
    }

    Hinweis: Beachten Sie, dass Sie für jeden eingereichten Hinweis eine separate E-Mail erhalten. Dies ist eine automatisiert versandte E-Mail, auf die Sie nicht antworten können.

    Nach Abschluss der Beteiligung werden Ihre Hinweise fachlich geprüft und in die Abwägung zur Überarbeitung des Zielnetzentwurfs mit einbezogen.

    Mit freundlichen Grüßen
    i.A. das Team vom Trassenscout


    FixMyCity GmbH
    Oberlandstraße 26-35
    12099 Berlin
    www.fixmycity.de
    Geschäftsführer: Boris Hekele und Heiko Rintelen
    `,
    HTMLPart: `
      <p>
        Guten Tag, ${userFirstname} ${userLastname},
      </p>
      <p>
        vielen Dank für Ihre Teilnahme! Hiermit bestätigen wir Ihnen den Eingang Ihres Beitrags mit
        folgenden Angaben:
      </p>
      <p>
        Eingangsdatum: ${new Date().toLocaleDateString("de-DE")} <br/><br />
        Kategorie: ${feedbackCategory} <br /><br />
        Ihre gewählte Verbindung im Netzentwurf: ${lineFromToName}
        <br /><br />
        Ihr Hinweis: <br />
        ${feedbackText}
        <br />
        ${
          feedbackLocation
            ? `<a target="_blank"
          href=https://www.openstreetmap.org/?mlat=${feedbackLocation.lat}&mlon=${feedbackLocation.lng}&zoom=16
        ><br />
          Ortsbezug des Beitrags (in OpenStreetMap)
        </a>`
            : ""
        }
      </p>
      <p>
          <i>Hinweis:</i>
        Beachten Sie, dass Sie für jeden eingereichten Hinweis eine separate E-Mail erhalten. Dies
        ist eine automatisiert versandte E-Mail, auf die Sie nicht antworten können.
      </p>
      <p>
        Nach Abschluss der Beteiligung werden Ihre Hinweise fachlich geprüft und in die Abwägung zur
        Überarbeitung des Zielnetzentwurfs mit einbezogen.
      </p>
      <p>
        Mit freundlichen Grüßen <br />
        i.A. das Team vom Trassenscout
      </p>
      <p>
        <small>FixMyCity GmbH</small>
        <br />
        <small>Oberlandstraße 26-35</small>
        <br />
        <small>12099 Berlin</small>
        <br />
        <small>
          <a href="https://www.fixmycity.de/">www.fixmycity.de</a>
        </small>
        <br />
        <small>
        Geschäftsführer: Boris Hekele und Heiko Rintelen
        </small>
      </p>
        <img
          src="https://images.squarespace-cdn.com/content/v1/605af904f08f5246bc415204/1616576639935-WCJVD5JU8LNMBBSFIYHV/Logo_Positiv%402x.png?format=1500w"
          alt="FixMyCity Logo"
          width="60"
        />
      `,
  }

  return {
    async send() {
      if (process.env.NODE_ENV !== "development") {
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
