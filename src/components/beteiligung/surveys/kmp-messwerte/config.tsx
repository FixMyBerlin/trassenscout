import { backendConfig } from "@/src/components/beteiligung/shared/backend-types"
import type { FormConfig } from "@/src/components/beteiligung/shared/types"
import { part2Config } from "@/src/components/beteiligung/surveys/kmp-messwerte/part2"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Messwerte zum Klimamobilitätsplan im Landkreis Ludwigsburg übermitteln",
    logoUrl: "https://trassenscout.de/favicon.svg",
    canonicalUrl: "https://trassenscout.de/beteiligung/kmp-messwerte",
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
    title: "Messwert erfolgreich übermittelt",
    description: `Vielen Dank. Ihr Messwert wurde übermittelt und im Trassenscout erfasst.

Ihre Kommune erhält eine Bestätigungsmail an die im Formular angegebene E-Mail-Adresse.

Bei Fragen zum Formular erreichen Sie uns unter [trassenscout@fixmycity.de](mailto:trassenscout@fixmycity.de).`,
    buttons: [
      {
        action: "part2",
        label: "Weiteren Messwert erfassen",
        position: "left",
        color: "primaryColor",
      },
    ],
    homeUrl: "https://trassenscout.de/beteiligung/kmp-messwerte",
    buttonLink: {
      label: "Zurück zur Startseite",
      color: "white",
    },
  },
  backend: {
    ...backendConfig,
    labels: { ...backendConfig.labels, category: { sg: "Indikator" } },
  },
  email: {
    subject: "Bestätigung Ihrer Messwerterfassung – Klimamobilitätsplan Landkreis Ludwigsburg",
    markdown: `Guten Tag,

vielen Dank für Ihre Übermittlung. Ihre Angaben zum Klimamobilitätsplan im Landkreis Ludwigsburg wurden im Trassenscout erfasst.

Zur Dokumentation erhalten Sie eine Zusammenfassung Ihrer Angaben:

- **Kommune:** {{commune}}
- **Indikator:** {{category}}
- **Messwert:** {{feedbackText}}
- **Messdatum / Bezugszeitraum:** {{measurementDate}}
- **Kommentar:** {{comment}}

Bei Fragen zum Formular erreichen Sie uns unter [trassenscout@fixmycity.de](mailto:trassenscout@fixmycity.de).

Mit freundlichen Grüßen

Ihr Trassenscout-Team`,
    fields: ["commune", "category", "feedbackText", "measurementDate", "comment"],
  },
  adminEmail: null,
} satisfies FormConfig
