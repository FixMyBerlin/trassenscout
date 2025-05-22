import { IntroPart1 } from "@/src/app/beteiligung-neu/_rstest-1-2-3/SurveyRsTest123"
import { fieldValidationEnum } from "@/src/app/beteiligung-neu/_shared/fieldvalidationEnum"
import { SurveyPart1and3 } from "@/src/app/beteiligung-neu/_shared/types"

export const part1Config: SurveyPart1and3 = {
  progressBarDefinition: 1,
  intro: {
    type: "custom",
    customComponent: <IntroPart1 />,
    buttons: [{ action: "next", label: "Weiter", position: "right" }],
  },
  buttonLabels: { next: "Weiter", back: "Zurück", submit: "Absenden" },
  pages: [
    {
      id: "verkehr1",
      fields: [
        {
          name: "titleTraffic",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "verkehrsmittel" },
        },
        {
          name: "descriptionTraffic",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown: "Erzählen Sie uns zum Einstieg davon, welche Verkehrsmittel Sie nutzen.",
          },
        },
        {
          name: "verkehrsmittelNutzung",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Welche dieser Verkehrsmittel nutzen Sie täglich oder fast täglich?",
            options: [
              { key: "zu_fuss", label: "Zu Fuß (länger als 15 Minuten)" },
              { key: "rollstuhl", label: "Rollstuhl" },
              { key: "bike", label: "Fahrrad (ohne Motor)" },
              { key: "e_bike", label: "Pedelec / E-Bike" },
              { key: "e_scooter", label: "E-Scooter" },
              { key: "bus_bahn", label: "Bus & Bahn" },
              { key: "auto", label: "Auto" },
              { key: "car_sharing", label: "Carsharing" },
            ],
          },
        },
        {
          name: "verkehrsmittelBesitz",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["optionalArrayOfString"],
          defaultValue: [],
          props: {
            label: "Welche Verkehrsmittel besitzen Sie?",
            options: [
              { key: "rollstuhl", label: "Rollstuhl" },
              { key: "bike", label: "Fahrrad (ohne Motor)" },
              { key: "e_bike", label: "Pedelec / E-Bike" },
              { key: "e_scooter", label: "E-Scooter" },
              { key: "motorrad", label: "Roller / Motorrad" },
              { key: "bus_bahn", label: "Monatsticket Nahverkehr" },
              { key: "auto", label: "Eigenes Auto" },
              { key: "car_sharing", label: "Carsharing" },
            ],
          },
        },
        {
          name: "verkehrsmittelBesitz_min2",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfStringMin2"],
          defaultValue: [],
          props: {
            label: "Welche Verkehrsmittel besitzen Sie? 2",
            description: "Bitte mindestens 2 Antworten auswählen",
            options: [
              { key: "rollstuhl", label: "Rollstuhl" },
              { key: "bike", label: "Fahrrad (ohne Motor)" },
              { key: "e_bike", label: "Pedelec / E-Bike" },
              { key: "e_scooter", label: "E-Scooter" },
              { key: "motorrad", label: "Roller / Motorrad" },
              { key: "bus_bahn", label: "Monatsticket Nahverkehr" },
              { key: "auto", label: "Eigenes Auto" },
              { key: "car_sharing", label: "Carsharing" },
            ],
          },
        },
        {
          name: "verkehrsmittelBesitz_max3",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["optionalArrayOfStringMax3"],
          defaultValue: [],
          props: {
            label: "Welche Verkehrsmittel besitzen Sie? 3",
            description: "Bitte maximal 3 Antworten auswählen",
            options: [
              { key: "rollstuhl", label: "Rollstuhl" },
              { key: "bike", label: "Fahrrad (ohne Motor)" },
              { key: "e_bike", label: "Pedelec / E-Bike" },
              { key: "e_scooter", label: "E-Scooter" },
              { key: "motorrad", label: "Roller / Motorrad" },
              { key: "bus_bahn", label: "Monatsticket Nahverkehr" },
              { key: "auto", label: "Eigenes Auto" },
              { key: "car_sharing", label: "Carsharing" },
            ],
          },
        },
      ],
    },
    {
      id: "2",
      fields: [
        {
          name: "titleTraffic2",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Nutzung und Gestaltung FRM7" },
        },
        {
          name: "descriptionTraffic2",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown:
              "In diesem Teil geht es um den Radschnellweg. Wir möchten von Ihnen wissen, ob und wie Sie den Radweg nutzen würden und wie dieser gestaltet sein soll.",
          },
        },
        {
          name: "nutzen",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Würden Sie den FRM7 nutzen?",
            options: [
              { key: "ja", label: "Ja" },
              { key: "nein", label: "Nein" },
              {
                key: "irrelevant",
                label: "Ich bin ohnehin nicht zwischen Frankfurt und Hanau unterwegs.",
              },
            ],
          },
        },
        {
          name: "wichtig",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Was ist Ihnen beim Radfahren besonders wichtig?",

            options: [
              {
                key: "sicherheit",
                label:
                  "Ich fahre gern in ruhigen Wohnstraßen, auch wenn dort Autos unterwegs sind.",
              },
              {
                key: "schnelligkeit",
                label:
                  "Ich fahre lieber auf sicheren Radwegen an großen Straßen, weil ich dann zügiger vorankomme.",
                description:
                  "Als sichere Radwege verstehen wir Radwege, die entweder baulich vom Autoverkehr getrennt oder farblich deutlich hervorgehoben sind.",
              },
            ],
          },
        },
        {
          name: "autos",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Eine Fahrradstraße, auf der auch Autos erlaubt sind, würde ich...",
            options: [
              {
                key: "nicht",
                label: "Mit dem Rad nutzen.",
              },
              {
                key: "selten",
                label: "Eher selten mit dem Rad nutzen.",
              },
              {
                key: "nie",
                label: "Nie mit dem Rad nutzen.",
              },
              {
                key: "keine_angabe",
                label: "Keine Angabe",
              },
            ],
          },
        },
      ],
    },
  ],
}
