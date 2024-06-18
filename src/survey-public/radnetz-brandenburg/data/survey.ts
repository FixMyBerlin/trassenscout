import { isProduction } from "src/core/utils"
import { TSurvey } from "src/survey-public/components/types"

export const surveyDefinition: TSurvey = {
  part: 1,
  version: 1,
  // todo survey
  logoUrl: isProduction
    ? "https://trassenscout.de/logo-land-bb.png"
    : "https://staging.trassenscout.de/logo-land-bb.png",
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
        de: "Bitte tragen Sie zunächst Ihren Name, Ihre Institution und den Pin ein,  den Sie per Mail erhalten haben..",
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
          label: { de: "E-Mail" },
          component: "textfield",
          props: { placeholder: { de: "beispiel@beispiel.de" } },
        },
        {
          id: 4,
          label: { de: "PIN" },
          help: { de: "Ihre PIN haben Sie per Email erhalten." },
          component: "textfield",
          props: { placeholder: { de: "1234" } },
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
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
    {
      id: 2,
      title: { de: "Nutzung und Gestaltung FRM7" },
      description: {
        de: "In diesem Teil geht es um den Radschnellweg. Wir möchten von Ihnen wissen, ob und wie Sie den Radweg nutzen würden und wie dieser gestaltet sein soll.",
      },
      questions: [
        {
          id: 9,
          label: {
            de: "Würden Sie den x nutzen?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              { id: 2, text: { de: "Nein" } },
              {
                id: 3,
                text: { de: "Ich bin ohnehin nicht...." },
              },
            ],
          },
        },
        {
          id: 10,
          label: {
            de: "Wie oft würden Sie den x nutzen?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Täglich oder fast täglich" } },
              { id: 2, text: { de: "Mehrmals pro Woche" } },
              { id: 3, text: { de: "Mehrmals im Monat" } },
              { id: 4, text: { de: "Seltener oder Nie" } },
            ],
          },
        },
      ],
      buttons: [
        { label: { de: "Absenden" }, color: "primaryColor", onClick: { action: "submit" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
  ],
}
