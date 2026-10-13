import { backendConfig } from "@/src/components/beteiligung/shared/backend-types"
import { FormConfig } from "@/src/components/beteiligung/shared/types"
import { part2Config } from "@/src/components/beteiligung/surveys/radschnellverbindungen-massnahmenmeldungen/part2"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Maßnahmenmeldung Radschnellverbindungen",
    logoUrl: "https://radschnellverbindungen.info/favicon.svg",
    canonicalUrl: "https://trassenscout.de/beteiligung/radschnellverbindungen-massnahmenmeldungen",
    maptilerUrl: "https://api.maptiler.com/maps/positron/style.json",
    primaryColor: "#059669",
    darkColor: "#047857",
    lightColor: "#d1fae5",
  },
  part1: null,
  part2: part2Config,
  part3: null,
  end: {
    progressBarDefinition: 2,
    title: "Vielen Dank für Ihre Teilnahme",
    description: `Vielen Dank für Ihre Rückmeldung. Die von Ihnen gemeldete Maßnahme ist bei uns eingegangen und wurde gespeichert. Sie haben zur Bestätigung für jede von Ihnen gemeldete Maßnahme eine E-Mail erhalten.

## Wie geht es weiter?

Das digitale Meldeverfahren läuft noch bis zum 30.09.2027. Bis dahin können Sie auf dem gleichen Weg noch weitere Maßnahmen melden. Nach Abschluss des Meldeverfahrens werden die eingegangenen Meldungen durch FixMyCity geprüft.

Sie können jetzt direkt einen Einführungstermin zum Trassenscout buchen. In dem Termin zeigen wir Ihnen die wesentlichen Funktionen und besprechen, wie die Plattform für Ihre Radschnellverbindung eingesetzt werden kann.`,
    mailjetWidgetUrl: null,
    buttons: [
      {
        action: "part2",
        label: "Weitere Maßnahme melden",
        position: "left",
        color: "white",
      },
    ],
    homeUrl: "https://fixmycity.de/termin-vereinbaren/",
    buttonLink: {
      label: "Zur Terminbuchung",
      color: "primaryColor",
    },
  },
  backend: backendConfig,
  email: {
    subject: "Bestätigung Ihrer Maßnahmenmeldung zu einer Radschnellverbindung",
    markdown: `Sehr geehrte Damen und Herren,

vielen Dank für Ihre Maßnahmenmeldung im Zusammenhang mit einer Radschnellverbindung.

Wir bestätigen den Eingang Ihrer Meldung über das Online-Formular unter folgendem Link:
{{surveyUrl}}

Folgende Angaben wurden übermittelt:

- **Vorgangs-ID**: {{referenceId}}
- **Radschnellverbindung**: {{rsvName}}
- **Kategorie des Anliegens**: {{category}}
- **Bezug zu einem bestehenden Planungsabschnitt**: {{existingPlanningSection}}
- **Ortsangabe per Pin**: {{enableLocation}}
- **Beschreibung der Meldung**: {{feedbackText}}
- **Beschreibung der Dokumente**: {{uploadsDescription}}
- **Name einer zuständigen Kontaktperson**: {{contact}}
- **Telefonnummer für Rückfragen**: {{phone}}
- **E-Mail-Adresse**: {{email}}
- **Persönliche Nachricht**: {{personalMessage}}
- **Verortung**: {{location}}

Ihre Meldung wird nun durch FixMyCity geprüft. Bei Rückfragen melden wir uns über die von Ihnen angegebene Kontaktadresse.

Nach dem Absenden können Sie über die Danke-Seite direkt einen Einführungstermin zum Trassenscout buchen.

Mit freundlichen Grüßen

das Team von FixMyCity`,
    fields: [
      "referenceId",
      "rsvName",
      "category",
      "existingPlanningSection",
      "enableLocation",
      "feedbackText",
      "uploadsDescription",
      "contact",
      "phone",
      "email",
      "personalMessage",
      "location",
      "surveyUrl",
    ],
  },
  adminEmail: {
    subject: "Neue Maßnahmenmeldung zu einer Radschnellverbindung",
    markdown: `Hallo,

über das Online-Formular für Radschnellverbindungen ist eine neue Maßnahmenmeldung eingegangen.

Folgende Angaben wurden übermittelt:

- **Vorgangs-ID**: {{referenceId}}
- **Radschnellverbindung**: {{rsvName}}
- **Kategorie des Anliegens**: {{category}}
- **Bezug zu einem bestehenden Planungsabschnitt**: {{existingPlanningSection}}
- **Ortsangabe per Pin**: {{enableLocation}}
- **Beschreibung der Meldung**: {{feedbackText}}
- **Beschreibung der Dokumente**: {{uploadsDescription}}
- **Name einer zuständigen Kontaktperson**: {{contact}}
- **Telefonnummer für Rückfragen**: {{phone}}
- **E-Mail-Adresse**: {{email}}
- **Persönliche Nachricht**: {{personalMessage}}
- **Verortung**: {{location}}

Das Formular erreichen Sie unter folgendem Link:
{{surveyUrl}}

Viele Grüße

das Team von FixMyCity`,
    fields: [
      "referenceId",
      "rsvName",
      "category",
      "existingPlanningSection",
      "enableLocation",
      "feedbackText",
      "uploadsDescription",
      "contact",
      "phone",
      "email",
      "personalMessage",
      "location",
      "surveyUrl",
    ],
    recipients: ["rsv@dummy.de"],
  },
} satisfies FormConfig
