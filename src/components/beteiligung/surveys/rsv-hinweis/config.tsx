import { FormConfig } from "@/src/components/beteiligung/shared/types"
import { part2Config } from "@/src/components/beteiligung/surveys/rsv-hinweis/part2"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Hinweis zu Radschnellverbindungen",
    logoUrl: "https://radschnellverbindungen.info/favicon.svg",
    canonicalUrl: "https://trassenscout.de/beteiligung/rsv-hinweis",
    maptilerUrl: "https://api.maptiler.com/maps/positron/style.json",
    primaryColor: "#059669",
    darkColor: "#047857",
    lightColor: "#d1fae5",
  },
  part1: null,
  part2: part2Config,
  part3: null,
  end: {
    progressBarDefinition: 3,
    title: "Wie geht es weiter?",
    description: `Danke für Ihren Hinweis, wir melden uns bei Rückfragen und werden zeitnah ein Update veröffentlichen. Rückfragen gerne an [trassenscout@fixmycity.de](mailto:trassenscout@fixmycity.de).

Sie können auf dem gleichen Weg noch weitere Hinweise abgeben.

Sie können außerdem direkt einen [Einführungstermin zum Trassenscout buchen](https://fixmycity.de/termin-vereinbaren/). In dem Termin zeigen wir Ihnen die wesentlichen Funktionen und besprechen, wie die Plattform für Ihre Radschnellverbindung eingesetzt werden kann.`,
    buttons: [
      {
        action: "part2",
        label: "Weiteren Hinweis abgeben",
        position: "left",
        color: "primaryColor",
      },
    ],
    homeUrl: "https://radschnellverbindungen.info/steckbriefe/",
    buttonLink: {
      label: "Zurück zu den Steckbriefen",
      color: "white",
    },
  },
  backend: {
    status: [
      { value: "PENDING", label: "Ausstehend", color: "#FDEEBF", icon: "CLOCK" },
      { value: "ASSIGNED", label: "Zugeordnet", color: "#e0e7ff", icon: "DOCUMENT" },
      { value: "IRRELEVANT", label: "Nicht relevant", color: "#f3f4f6", icon: "XMARK" },
      {
        value: "HANDED_OVER",
        label: "Übergeben Planung",
        color: "#e0e7ff",
        icon: "DOCUMENT",
      },
      { value: "DONE_FAQ", label: "Erledigt (FAQ)", color: "#D1FAE5", icon: "CHECKMARK" },
      {
        value: "DONE_PLANING",
        label: "Erledigt (Planung)",
        color: "#D1FAE5",
        icon: "CHECKMARK",
      },
    ],
  },
  email: null,
  adminEmail: {
    subject: "Neuer Hinweis zu einer Radschnellverbindung",
    markdown: `Hallo,

über das Online-Formular für Radschnellverbindungen ist ein neuer Hinweis eingegangen.

Folgende Angaben wurden übermittelt:

- **Strecke**: {{geometryCategoryLabel}}
- **Hinweis**: {{feedbackText}}
- **Beschreibung der Dokumente**: {{uploadsDescription}}
- **Verortung**: {{location}}
- **Name einer zuständigen Kontaktperson**: {{contact}}
- **Telefonnummer für Rückfragen**: {{phone}}
- **E-Mail-Adresse**: {{email}}
- **Persönliche Nachricht**: {{personalMessage}}

Das Formular erreichen Sie unter folgendem Link:
{{surveyUrl}}

Mit freundlichen Grüßen

das Team vom Trassenscout`,
    fields: [
      "geometryCategoryLabel",
      "feedbackText",
      "uploadsDescription",
      "location",
      "contact",
      "phone",
      "email",
      "personalMessage",
      "surveyUrl",
    ],
    recipients: ["noreply@trassenscout.de"],
  },
} satisfies FormConfig
