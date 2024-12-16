import { TSurvey } from "@/src/survey-public/components/types"

export const surveyDefinition: TSurvey = {
  part: 1,
  version: 1,
  // todo survey
  logoUrl: "https://trassenscout.de/radnetz-brandenburg/bb-logo.png",
  canonicalUrl:
    "https://mil.brandenburg.de/mil/de/themen/mobilitaet-verkehr/radverkehr/radnetz-brandenburg/",
  maptilerUrl: "https://api.maptiler.com/maps/1628cd25-069f-45bc-9e1e-9768388fe544/style.json",
  primaryColor: "#C73C35",
  darkColor: "#651E1B",
  lightColor: "#DF8A86",
  pages: [
    {
      id: 1,
      title: { de: "Angaben zur Identifikation" },
      description: {
        de: "Bitte tragen Sie zunächst Ihren Namen, Ihre E-Mail-Adresse sowie die PIN, die Sie per E-Mail erhalten haben, ein.",
      },
      questions: [
        {
          id: 1,
          label: { de: "Vorname" },
          component: "textfield",
          props: {
            responses: [
              { id: 1, text: { de: "Täglich oder fast täglich" } },
              { id: 2, text: { de: "Mehrmals pro Woche" } },
              { id: 3, text: { de: "Mehrmals im Monat" } },
              { id: 4, text: { de: "Seltener oder Nie" } },
            ],
          },
        },
        {
          id: 2,
          label: { de: "Nachname" },
          component: "textfield",
          props: {},
        },
        {
          id: 3,
          label: { de: "E-Mail-Adresse" },
          component: "textfield",
          props: {
            validation: { type: "email" },
          },
        },
        {
          id: 4,
          label: { de: "PIN (4-stellig)" },
          help: {
            de: "Tragen Sie hier die 4-stellige PIN ein, die Sie von uns per E-Mail erhalten haben.",
          },
          component: "textfield",
          props: {
            validation: { minLength: 4, maxLength: 4 },
          },
        },
        {
          id: 5,
          label: { de: "Institution" },
          component: "readOnly",
          help: { de: "Ihre Institution wird automatisch eingetragen." },
          props: { queryId: "institution" },
        },
        {
          id: 6,
          label: { de: "Landkreis" },
          component: "readOnly",
          help: { de: "Ihr Landkreis wird automatisch eingetragen." },
          props: { queryId: "landkreis" },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "primaryColor", onClick: { action: "nextPage" } },
        {
          label: { de: "Zurück" },
          color: "white",
          onClick: { action: "previousPage" },
        },
      ],
    },
    {
      id: 2,
      title: { de: "Allgemeine Fragen" },
      description: {
        de: `Ergänzend zur Beteiligung finden Sie nachfolgend zwei allgemeine Fragen zur Beantwortung.

*Bitte beachten Sie:* Wenn Sie den Tab schließen und die Beteiligung zu einem späteren Zeitpunkt fortführen, werden Sie wieder auf die Startseite der Beteiligung geleitet. Falls Sie die Umfrage also bereits abgeschickt haben, antworten Sie bitte mit “keine Antwort / bereits beantwortet”.
`,
      },
      questions: [
        {
          id: 9,
          label: {
            de: "Wie gut fühlen Sie sich bisher über die Entwicklung des Radnetz Brandenburg informiert?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Sehr gut " } },
              { id: 2, text: { de: "Eher gut" } },
              {
                id: 3,
                text: { de: "Eher schlecht" },
              },
              { id: 4, text: { de: "Schlecht " } },
              {
                id: 5,
                text: { de: "Ich habe bisher noch nichts vom Radnetz Brandenburg gehört." },
              },
              {
                id: 6,
                text: { de: "Keine Antwort / bereits beantwortet" },
              },
            ],
          },
        },
        {
          id: 10,
          label: {
            de: "Was würden Sie dazu gerne noch ergänzen? ",
          },
          component: "text",
          props: {
            caption: { de: "max. 5000 Zeichen" },
            validation: { maxLength: 5000 },
          },
        },
      ],
      buttons: [
        {
          label: { de: "Antworten speichern und weiter" },
          color: "primaryColor",
          onClick: { action: "submit" },
        },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
  ],
}
