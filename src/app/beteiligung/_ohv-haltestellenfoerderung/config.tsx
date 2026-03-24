import { part2Config } from "@/src/app/beteiligung/_ohv-haltestellenfoerderung/part2"
import { FormConfig } from "@/src/app/beteiligung/_shared/types"

export const OHV_VORGANGS_ID_PREFIX = "547010"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Maßnahmenmeldung",
    logoUrl: "https://www.oberhavel.de/media/custom/2244_71430_1_g.PNG?1606723864",
    canonicalUrl: "https://www.oberhavel.de/",
    maptilerUrl: "https://api.maptiler.com/maps/b09268b1-91d0-42e2-9518-321a1a94738f/style.json",
    hideProgressBar: true,
    primaryColor: "#006ab2",
    darkColor: "#00375D",
    lightColor: "#B8D5E9",
    geoCategoryFallback: [
      [13.463274, 52.914774],
      [13.463119, 52.914587],
      [13.46298, 52.914427],
      [13.461967, 52.913487],
      [13.461855, 52.913273],
      [13.461618, 52.912844],
      [13.461571, 52.912773],
      [13.461089, 52.91171],
      [13.461024, 52.91154],
      [13.460862, 52.911146],
      [13.4607, 52.910753],
      [13.460746, 52.910348],
      [13.460744, 52.909835],
      [13.460744, 52.909835],
      [13.460752, 52.909638],
      [13.46054, 52.907313],
      [13.460484, 52.90655],
      [13.460451, 52.906433],
      [13.460358, 52.906317],
      [13.460206, 52.906229],
      [13.458529, 52.905423],
      [13.458376, 52.905299],
      [13.457759, 52.904624],
      [13.456968, 52.903636],
      [13.456968, 52.903645],
      [13.456968, 52.903645],
      [13.456968, 52.903636],
      [13.454596, 52.900708],
      [13.453991, 52.89997],
      [13.453848, 52.899684],
      [13.453573, 52.899014],
      [13.452557, 52.896627],
      [13.452371, 52.896413],
      [13.451014, 52.894947],
      [13.449444, 52.893294],
      [13.448294, 52.891799],
      [13.447926, 52.891444],
      [13.447376, 52.890992],
      [13.444843, 52.889459],
      [13.441627, 52.887467],
      [13.438863, 52.88565],
      [13.438649, 52.885482],
      [13.438424, 52.885412],
      [13.438511, 52.885357],
      [13.438537, 52.885222],
      [13.438605, 52.885051],
      [13.438905, 52.884688],
      [13.439363, 52.884161],
      [13.439576, 52.883871],
      [13.439562, 52.883871],
      [13.439562, 52.883871],
      [13.439647, 52.883771],
      [13.439685, 52.883573],
      [13.439689, 52.883249],
      [13.439966, 52.882626],
      [13.439944, 52.882401],
      [13.439814, 52.88207],
      [13.439685, 52.881757],
      [13.438935, 52.880652],
      [13.438624, 52.880243],
      [13.439347, 52.880072],
      [13.439684, 52.87996],
      [13.439771, 52.879878],
      [13.439786, 52.879887],
      [13.439815, 52.87986],
      [13.439615, 52.879664],
      [13.439401, 52.879469],
      [13.43908, 52.879212],
      [13.438547, 52.878797],
      [13.438227, 52.878558],
      [13.438029, 52.878407],
      [13.437815, 52.878221],
      [13.437155, 52.877591],
      [13.436728, 52.877246],
      [13.436728, 52.877246],
      [13.43595, 52.876626],
      [13.435747, 52.876341],
      [13.433401, 52.875012],
      [13.433083, 52.874819],
      [13.432975, 52.874694],
      [13.432874, 52.874336],
      [13.429717, 52.874563],
      [13.427599, 52.874723],
      [13.425981, 52.874769],
      [13.425343, 52.874786],
      [13.424524, 52.874724],
      [13.418169, 52.874342],
      [13.414312, 52.874028],
      [13.413657, 52.873982],
      [13.410397, 52.873742],
      [13.408314, 52.873641],
      [13.407287, 52.873591],
      [13.407019, 52.873567],
      [13.405238, 52.873406],
      [13.40438, 52.873251],
      [13.40438, 52.873251],
      [13.404391, 52.873256],
      [13.404394, 52.873254],
      [13.404086, 52.873179],
      [13.403816, 52.873113],
      [13.402436, 52.87278],
      [13.402558, 52.87259],
      [13.402546, 52.87193],
      [13.402488, 52.871748],
      [13.402372, 52.871681],
      [13.402373, 52.871682],
      [13.402379, 52.871637],
      [13.40152, 52.871601],
      [13.398338, 52.871504],
      [13.397876, 52.871496],
      [13.397673, 52.871563],
      [13.39706, 52.871456],
      [13.396502, 52.871438],
      [13.396536, 52.871514],
      [13.391159, 52.871614],
      [13.391159, 52.871614],
      [13.386167, 52.870488],
      [13.386466, 52.870551],
      [13.384555, 52.869682],
      [13.382973, 52.869314],
      [13.382636, 52.869287],
      [13.382361, 52.869292],
      [13.382071, 52.869313],
      [13.381857, 52.869349],
      [13.381601, 52.869405],
      [13.381378, 52.869473],
      [13.381206, 52.869552],
      [13.381016, 52.869642],
      [13.38078, 52.869784],
      [13.379481, 52.871021],
      [13.378813, 52.871464],
      [13.378456, 52.871636],
      [13.377261, 52.872061],
      [13.376705, 52.872219],
      [13.375989, 52.872329],
      [13.375691, 52.872354],
      [13.375324, 52.872382],
      [13.37522, 52.872371],
      [13.372656, 52.872524],
      [13.372876, 52.87254],
      [13.368275, 52.872825],
      [13.366684, 52.873229],
      [13.359336, 52.875758],
      [13.347441, 52.879659],
      [13.347147, 52.879761],
    ],
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
    disableNote: true,
    labels: {
      category: {
        sg: "Gegenstand der Förderung",
      },
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

- **Gegenstand der Förderung**: {{category}}
- **Kommune**: {{commune}}
- **Beschreibung der Dokumente**: {{uploadsDescription}}
- **Verortung der Maßnahme:** {{location}}
- **Name der Haltestelle**: {{hsName}}
- **Maßnahmenbeschreibung und Zielsetzung**: {{feedbackText}}
- **Stand der Bauvorbereitung**: {{stateOfConstruction}}
- **Kostenschätzung**: {{costs}}
- **Ko-Finanzierung**: {{coFinancing}}
- **Ko-Finanzierung: Mittelgeber und Programm**: {{fundingSource}}
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
      "sharedBuilding",
      "realisationYear",
      "contact",
      "phone",
      "email",
      "location",
      "surveyUrl",
    ],
  },
  adminEmail: {
    subject: "Neue Maßnahmenmeldung zur Haltestellenförderung im Landkreis Oberhavel",
    markdown: `Sehr geehrte Damen und Herren,

über das Online-Formular zur Haltestellenförderung im Landkreis Oberhavel ist eine neue Maßnahmenmeldung eingegangen.

Folgende Angaben wurden übermittelt:

- **Vorgangs-ID**: {{vorgangsId}}
- **Gegenstand der Förderung**: {{category}}
- **Kommune**: {{commune}}
- **Beschreibung der Dokumente**: {{uploadsDescription}}
- **Verortung der Maßnahme**: {{location}}
- **Name der Haltestelle**: {{hsName}}
- **Maßnahmenbeschreibung und Zielsetzung**: {{feedbackText}}
- **Stand der Bauvorbereitung**: {{stateOfConstruction}}
- **Kostenschätzung**: {{costs}}
- **Ko-Finanzierung**: {{coFinancing}}
- **Ko-Finanzierung: Mittelgeber und Programm**: {{fundingSource}}
- **Gemeinschaftsbauwerk**: {{sharedBuilding}}
- **Voraussichtliches Realisierungsjahr**: {{realisationYear}}
- **Kontaktperson (optional)**: {{contact}}
- **Telefonnummer (optional)**: {{phone}}
- **E-Mail-Adresse**: {{email}}

Das Formular erreichen Sie unter folgendem Link:
{{surveyUrl}}

Mit freundlichen Grüßen

Trassenscout
`,
    fields: [
      "vorgangsId",
      "commune",
      "category",
      "uploadsDescription",
      "hsName",
      "feedbackText",
      "stateOfConstruction",
      "costs",
      "coFinancing",
      "fundingSource",
      "sharedBuilding",
      "realisationYear",
      "contact",
      "phone",
      "email",
      "location",
      "surveyUrl",
    ],
    recipients: ["lk@dummy.de", "ohbv@dummy.de"],
  },
}
