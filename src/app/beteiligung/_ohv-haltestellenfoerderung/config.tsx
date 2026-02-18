import { part2Config } from "@/src/app/beteiligung/_ohv-haltestellenfoerderung/part2"
import { FormConfig } from "@/src/app/beteiligung/_shared/types"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Maßnahmenmeldung",
    logoUrl: "https://www.oberhavel.de/media/custom/2244_71430_1_g.PNG?1606723864",
    canonicalUrl: "https://www.oberhavel.de/",
    maptilerUrl: "https://api.maptiler.com/maps/b09268b1-91d0-42e2-9518-321a1a94738f/style.json",
    primaryColor: "#006ab2",
    darkColor: "#00375D",
    lightColor: "#B8D5E9",
  },
  part1: null,
  part2: part2Config,
  part3: null,
  end: {
    progressBarDefinition: 7,
    title: "Vielen Dank für Ihre Teilnahme!",
    description: `Vielen Dank für Ihre Rückmeldung. Die von Ihnen gemeldeten Maßnahmen sind bei uns eingegangen und wurden gespeichert. Sie haben zur Bestätigung eine E-Mail erhalten.


## Wie geht es weiter?

Das digitale Meldeverfahren läuft noch bis zum 30.09.2025. Bis dahin können Sie auf dem gleichen Wege noch weitere Maßnahmen melden. Nach Abschluss des Meldeverfahrens werden die eingegangenen Meldungen durch die OHBV gesichtet und in Rücksprache mit dem Landkreis geprüft. Die Entscheidung über die Aufnahme in das 5-Jahresprogramm liegt beim Landkreis. Der Landkreis zieht ggf. intern weitere Abteilungen hinzu, wie z. B. für Schulwegsicherheit.

Nach Erstellung des Maßnahmenprogramms wird dieses per E-Mail an die Kommunen übermittelt. Die E-Mail enthält als Anlage die Zusammenstellung der aufgenommenen Maßnahmen. Die Kommunen erhalten auf dieser Grundlage in einem gesonderten Schritt die Aufforderung zur Antragstellung.
`,
    mailjetWidgetUrl: null,
    buttons: [
      {
        action: "part2",
        label: "Weitere Maßnahme melden",
        position: "left",
        color: "primaryColor",
      },
    ],
    homeUrl: "https://www.oberhavel.de/",
    buttonLink: {
      label: "Zur Website des Lankreis Oberhavel",
      color: "primaryColor",
    },
  },
  backend: {
    labels: {
      comment: {
        sg: "Gesprächsnotiz",
        pl: "Gesprächsnotizen",
        help: "Hier können Sie ein Anmeldegespräch vermerken. Erfassen Sie das Gesprächsdatum, notieren Sie einen Ansprechpartner und speichern Sie eine kurze Gesprächsnotiz. Bitte starten Sie immer mit ihrem Namen oder Kürzel.",
      },
    },
    additionalFilters: [
      {
        label: "Kommune",
        id: "commune",
        value: "commune",
        surveyPart: "part2",
      },
    ],
    status: [
      { value: "PENDING", label: "Ausstehend", color: "#FDEEBF", icon: "CLOCK" },
      {
        value: "DOCUMENTS_MISSING",
        label: "Unterlagen nachzureichen",
        color: "#FEF3C7",
        icon: "DOCUMENT",
      },
      {
        value: "REJECTED_HOUSEHOLD_RESERVATION",
        label: "Maßnahme abgelehnt (Haushaltsvorbehalt)",
        color: "#FEE2E2",
        icon: "XMARK",
      },
      {
        value: "REJECTED",
        label: "Maßnahme abgelehnt",
        color: "#FECACA",
        icon: "XMARK",
      },
      { value: "ACCEPTED", label: "Maßnahme freigegeben", color: "#D1FAE5", icon: "CHECKMARK" },
    ],
  },
  email: {
    subject: "Bestätigung Ihrer Maßnahmenmeldung zur Haltestellenförderung im Landkreis Oberhavel",
    markdown: `Sehr geehrte Damen und Herren,

vielen Dank für Ihre Eingabe im Rahmen der digitalen Maßnahmenmeldung zur Haltestellenförderung des Landkreises Oberhavel.

Wir bestätigen den Eingang Ihrer Meldung über das Online-Formular unter folgendem Link:
{{surveyUrl}}

Folgende Angaben wurden übermittelt:

- **Fördergegenstand**: {{category}}
- **Kommune**: {{commune}}
- **Beschreibung der Dokumente**: {{uploadsDescription}}
- **Verortung der Maßnahme:** {{geometryCategory}}
- **Name der Haltestelle**: {{hsName}}
- **Maßnahmenbeschreibung und Zielsetzung**: {{feedbackText}}
- **Stand der Bauvorbereitung**: {{stateOfConstruction}}
- **Kostenschätzung**: {{costs}}
- **Ko-Finanzierung**: {{coFinancing}}
- **Ko-Finanzierung: Mittelgeber**: {{fundingSource}}
- **Ko-Finanzierung: Programm**: {{programName}}
- **Gemeinschaftsbauwerk**: {{sharedBuilding}}
- **Voraussichtliches Realisierungsjahr**: {{realisationYear}}
- **Kontaktperson (optional)**: {{contact}}
- **Telefonnummer (optional)**: {{phone}}
- **E-Mail-Adresse**: {{email}}

Ihre Meldung wird nun durch die zuständige Stelle bei der OHBV als Hauptaufgabenträger und anschließend durch den Landkreis geprüft. Bei Rückfragen werden wir uns gegebenenfalls bei Ihnen melden.

Sollten Sie weitere Maßnahmen melden wollen, können Sie das Formular erneut ausfüllen.

Mit freundlichen Grüßen

i. A. Alexander Greifenberg
im Auftrag des Landkreises Oberhavel
`,
    fields: [
      "commune",
      "category",
      "uploadsDescription",
      "hsName",
      "feedbackText",
      "stateOfConstruction",
      "costs",
      "coFinancing",
      "fundingSource",
      "programName",
      "sharedBuilding",
      "realisationYear",
      "contact",
      "phone",
      "email",
      "geometryCategory",
      "surveyUrl",
    ],
  },
}
