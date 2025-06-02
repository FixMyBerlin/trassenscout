import { IntroPart1 } from "@/src/app/beteiligung-neu/_radnetz-brandenbrug/SurveyBB"
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
      id: "1",
      fields: [
        {
          name: "titleId",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Angaben zur Identifikation" },
        },
        {
          name: "descriptionId",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown:
              "Bitte tragen Sie zunächst Ihren Namen, Ihre E-Mail-Adresse sowie die PIN, die Sie per E-Mail erhalten haben, ein.",
          },
        },
        {
          name: "1",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Vorname",
          },
        },
        {
          name: "2",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Nachname",
          },
        },
        {
          name: "3",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "E-Mail-Adresse",
          },
        },
        {
          name: "4",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "PIN (4-stellig)",
            description:
              "Tragen Sie hier die 4-stellige PIN ein, die Sie von uns per E-Mail erhalten haben.",
          },
        },
        // origininally readonly field, but not relevant for backend
        {
          name: "5",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Institution",
            description: "Ihre Institution wird automatisch eingetragen.",
          },
        },
        // origininally readonly field, but not relevant for backend
        {
          name: "6",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Landkreis",
            description: "Ihr Landkreis wird automatisch eingetragen.",
          },
        },
      ],
    },
    {
      id: "2",
      fields: [
        {
          name: "titleAllgemein",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Allgemeine Fragen" },
        },
        {
          name: "descriptionAllgemein",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown: `Ergänzend zur Beteiligung finden Sie nachfolgend zwei allgemeine Fragen zur Beantwortung.

*Bitte beachten Sie:* Wenn Sie den Tab schließen und die Beteiligung zu einem späteren Zeitpunkt fortführen, werden Sie wieder auf die Startseite der Beteiligung geleitet. Falls Sie die Umfrage also bereits abgeschickt haben, antworten Sie bitte mit “keine Antwort / bereits beantwortet”.
`,
          },
        },
        {
          name: "9",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label:
              "Wie gut fühlen Sie sich bisher über die Entwicklung des Radnetz Brandenburg informiert?",
            options: [
              { key: "1", label: "Sehr gut " },
              { key: "2", label: "Eher gut" },
              { key: "3", label: "Eher schlecht" },
              { key: "4", label: "Schlecht " },
              { key: "5", label: "Ich habe bisher noch nichts vom Radnetz Brandenburg gehört." },
              { key: "6", label: "Keine Antwort / bereits beantwortet" },
            ],
          },
        },
        {
          name: "10",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Was würden Sie dazu gerne noch ergänzen?",
            description: "max. 5000 Zeichen",
          },
        },
      ],
    },
  ],
}
