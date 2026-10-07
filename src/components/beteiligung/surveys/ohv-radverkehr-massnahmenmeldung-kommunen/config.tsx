import { backendConfig } from "@/src/components/beteiligung/shared/backend-types"
import { FormConfig } from "@/src/components/beteiligung/shared/types"
import { part2Config } from "@/src/components/beteiligung/surveys/ohv-radverkehr-massnahmenmeldung-kommunen/part2"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Maßnahmenmeldung im Rahmen der kommunalen Beteiligung zum Radnetzkonzept",
    logoUrl: "https://www.oberhavel.de/media/custom/2244_71430_1_g.PNG?1606723864",
    canonicalUrl: "https://www.oberhavel.de/",
    maptilerUrl: "https://api.maptiler.com/maps/b09268b1-91d0-42e2-9518-321a1a94738f/style.json",
    primaryColor: "#02558e",
    darkColor: "#00375D",
    lightColor: "#B8D5E9",
  },
  part1: null,
  part2: part2Config,
  part3: null,
  end: {
    progressBarDefinition: 2,
    title: "Vielen Dank für Ihre Teilnahme",
    description: `Vielen Dank für Ihre Rückmeldung. Die von Ihnen gemeldete Maßnahme ist bei uns eingegangen und wurde gespeichert. Sie haben zur Bestätigung für jede von Ihnen gemeldete Maßnahme eine E-Mail erhalten.

## Wie geht es weiter?

Das digitale Meldeverfahren läuft noch bis zum 30.09.2027. Bis dahin können Sie auf dem gleichen Wege noch weitere Maßnahmen melden. Nach Abschluss des Meldeverfahrens werden die eingegangenen Meldungen durch den Landkreis geprüft.

Nach Erstellung des Maßnahmenprogramms wird dieses per E-Mail an die Kommunen übermittelt. Die E-Mail enthält als Anlage die Zusammenstellung der aufgenommenen Maßnahmen. Die Kommunen erhalten auf dieser Grundlage in einem gesonderten Schritt die Aufforderung zur Antragstellung.`,
    mailjetWidgetUrl: null,
    buttons: [
      {
        action: "part2",
        label: "Weitere Maßnahme melden",
        position: "left",
        color: "white",
      },
    ],
    homeUrl: "https://www.oberhavel.de/",
    buttonLink: {
      label: "Zur Website des Landkreises Oberhavel",
      color: "primaryColor",
    },
  },
  backend: backendConfig,
  email: {
    subject: "Bestätigung Ihrer Maßnahmenmeldung zum Radnetzkonzept im Landkreis Oberhavel",
    markdown: `Sehr geehrte Damen und Herren,

vielen Dank für Ihre Eingabe im Rahmen der kommunalen Maßnahmenmeldung zum Radnetzkonzept im Landkreis Oberhavel.

Wir bestätigen den Eingang Ihrer Meldung über das Online-Formular unter folgendem Link:
{{surveyUrl}}

Folgende Angaben wurden übermittelt:

- **Vorgangs-ID**: {{referenceId}}
- **Meldende Kommune**: {{municipality}}
- **Kategorie der Maßnahme**: {{category}}
- **Bezug auf eine Maßnahme im Bestand**: {{existingNetworkMeasure}}
- **Ortsangabe per Pin**: {{enableLocation}}
- **Beschreibung der Meldung**: {{feedbackText}}
- **Priorisierung der Maßnahme**: {{priority}}
- **Begründung der Priorität**: {{priorityReason}}
- **Beschreibung der Dokumente**: {{uploadsDescription}}
- **Name einer zuständigen Kontaktperson**: {{contact}}
- **Telefonnummer für Rückfragen**: {{phone}}
- **E-Mail-Adresse**: {{email}}
- **Verortung**: {{location}}

Ihre Meldung wird nun durch die zuständige Stelle geprüft. Bei Rückfragen werden wir uns gegebenenfalls bei Ihnen melden.

Sollten Sie weitere Maßnahmen melden wollen, können Sie das Formular erneut ausfüllen.

Mit freundlichen Grüßen

im Auftrag des Landkreises Oberhavel`,
    fields: [
      "referenceId",
      "municipality",
      "category",
      "existingNetworkMeasure",
      "enableLocation",
      "feedbackText",
      "priority",
      "priorityReason",
      "uploadsDescription",
      "contact",
      "phone",
      "email",
      "location",
      "surveyUrl",
    ],
  },
  adminEmail: {
    subject: "Neue Maßnahmenmeldung zum Radnetzkonzept im Landkreis Oberhavel",
    markdown: `Sehr geehrte Damen und Herren,

über das Online-Formular zur kommunalen Maßnahmenmeldung zum Radnetzkonzept im Landkreis Oberhavel ist eine neue Maßnahmenmeldung eingegangen.

Folgende Angaben wurden übermittelt:

- **Vorgangs-ID**: {{referenceId}}
- **Meldende Kommune**: {{municipality}}
- **Kategorie der Maßnahme**: {{category}}
- **Bezug auf eine Maßnahme im Bestand**: {{existingNetworkMeasure}}
- **Ortsangabe per Pin**: {{enableLocation}}
- **Beschreibung der Meldung**: {{feedbackText}}
- **Priorisierung der Maßnahme**: {{priority}}
- **Begründung der Priorität**: {{priorityReason}}
- **Beschreibung der Dokumente**: {{uploadsDescription}}
- **Name einer zuständigen Kontaktperson**: {{contact}}
- **Telefonnummer für Rückfragen**: {{phone}}
- **E-Mail-Adresse**: {{email}}
- **Verortung**: {{location}}

Das Formular erreichen Sie unter folgendem Link:
{{surveyUrl}}

Mit freundlichen Grüßen

das Team vom Trassenscout`,
    fields: [
      "referenceId",
      "municipality",
      "category",
      "existingNetworkMeasure",
      "enableLocation",
      "feedbackText",
      "priority",
      "priorityReason",
      "uploadsDescription",
      "contact",
      "phone",
      "email",
      "location",
      "surveyUrl",
    ],
    recipients: ["noreply@trassenscout.de"],
  },
} satisfies FormConfig
