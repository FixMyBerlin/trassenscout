import { fieldValidationEnum } from "@/src/app/beteiligung/_shared/fieldvalidationEnum"
import { SurveyPart1and3 } from "@/src/app/beteiligung/_shared/types"

export const part1Config: SurveyPart1and3 = {
  progressBarDefinition: 1,
  intro: {
    type: "standard",
    title: "Ihre Meinung ist gefragt",
    description:
      "Auf dem Weg zur Schule, Sportstätte und Arbeitsplatz, beim Wocheneinkauf oder dem Familienausflug – unser Ziel ist, dass der Radschnellweg von vielen Menschen angenommen wird.\n\nDeshalb interessieren uns die Ideen, Anmerkungen und Hinweise von Alltagsexpertinnen und -experten. Sie kennen sich vor Ort aus. Unterstützen Sie das Planungsteam dabei, den RS 8 zum Erfolgsprojekt zu machen!\n\nDie Bürgerbeteiligung läuft noch bis zum 20.08.2023. Die Beantwortung dauert ca. 5-10 Minuten.",
    buttons: [{ action: "next", label: "Beteiligung starten", position: "right" }],
  },
  buttonLabels: { next: "Weiter", back: "Zurück", submit: "Absenden" },
  pages: [
    {
      id: "2",
      fields: [
        {
          name: "titleNutzung",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Nutzung" },
        },
        {
          name: "descriptionNutzung",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown:
              "Zuerst möchten wir Ihnen einige Fragen zur Nutzung des RS 8 Ludwigsburg–Waiblingen stellen.",
          },
        },
        {
          name: "1",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Würden Sie den RS 8 nutzen?",
            options: [
              { key: "1", label: "Ja" },
              {
                key: "2",
                label: "Nein",
                description:
                  "Warum nicht? Wir freuen uns, wenn Sie das Freifeldtext im späteren Teil Weiteres Feedback nutzen, um uns Ihre Gründe zu nennen. Besten Dank!",
              },
              {
                key: "3",
                label: "Ich bin ohnehin nicht zwischen Ludwigsburg und Waiblingen unterwegs.",
              },
            ],
          },
        },
        {
          name: "2",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Wie häufig würden Sie den RS 8 nutzen?",
            options: [
              { key: "1", label: "Täglich" },
              { key: "2", label: "Mehrmals pro Woche" },
              { key: "3", label: "Mehrmals im Monat" },
              { key: "4", label: "Seltener oder Nie" },
            ],
          },
        },
        {
          name: "3",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Für welche Zwecke würden Sie den RS 8 nutzen?",
            options: [
              { key: "1", label: "Einkaufen" },
              { key: "2", label: "Zur Arbeit/Schule pendeln" },
              { key: "3", label: "Sport/Freizeit" },
              { key: "4", label: "Anderes" },
            ],
          },
        },
        {
          name: "4",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Würden Sie durch den RS 8 häufiger aufs Auto verzichten?",
            options: [
              { key: "1", label: "Ja" },
              { key: "2", label: "Nein" },
              { key: "3", label: "Ich verzichte bereits aufs Auto." },
              { key: "4", label: "Weiß nicht / Keine Angabe" },
            ],
          },
        },
        {
          name: "5",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Glauben Sie, dass andere durch den RS 8 häufiger aufs Auto verzichten würden?",
            options: [
              { key: "1", label: "Ja" },
              { key: "2", label: "Nein" },
              { key: "3", label: "Weiß nicht / Keine Angabe" },
            ],
          },
        },
      ],
    },
    {
      id: "3",
      fields: [
        {
          name: "titleAusstattung",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Ausstattung" },
        },
        {
          name: "descriptionAusstattung",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown: "Wie wichtig sind Ihnen folgende Ausstattungsmerkmale bei Radschnellwegen?",
          },
        },
        {
          name: "6",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Wie wichtig ist Ihnen die Beleuchtung des RS 8?",
            options: [
              { key: "1", label: "Eher wichtig" },
              { key: "2", label: "Weniger wichtig" },
              { key: "3", label: "Weiß nicht" },
            ],
          },
        },
        {
          name: "7",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Wie wichtig sind Ihnen Rastmöglichkeiten entlang der Strecke?",
            options: [
              { key: "1", label: "Eher wichtig" },
              { key: "2", label: "Weniger wichtig" },
              { key: "3", label: "Weiß nicht" },
            ],
          },
        },
        {
          name: "8",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label:
              "Wie wichtig sind Ihnen Reparatursäulen (Luftpumpe, Werkzeug) entlang der Strecke?",
            options: [
              { key: "1", label: "Eher wichtig" },
              { key: "2", label: "Weniger wichtig" },
              { key: "3", label: "Weiß nicht" },
            ],
          },
        },
      ],
    },
    {
      id: "4",
      fields: [
        {
          name: "titleWegefuhrung",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Gemeinsame Wegeführung" },
        },
        {
          name: "descriptionWegefuhrung",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown:
              "Leider wird es nicht überall möglich sein, Wege zu bauen, die ausschließlich dem Radverkehr vorbehalten sind. Wir möchten gerne von Ihnen wissen, welche Folgen das für Ihre Nutzung des RS 8 hätte.",
          },
        },
        {
          name: "9",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Einen Weg, auf dem auch Fußverkehr zugelassen ist, würde ich …",
            options: [
              { key: "1", label: "ohne Einschränkung mit dem Rad nutzen." },
              { key: "2", label: "eher selten mit dem Rad nutzen." },
              { key: "3", label: "nie mit dem Rad nutzen." },
              { key: "4", label: "Weiß ich nicht." },
            ],
          },
        },
        {
          name: "10",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Eine Fahrradstraße, die auch von Kfz befahren werden darf, würde ich …",
            options: [
              { key: "1", label: "ohne Einschränkung mit dem Rad nutzen." },
              { key: "2", label: "eher selten mit dem Rad nutzen." },
              { key: "3", label: "nie mit dem Rad nutzen." },
              { key: "4", label: "Weiß ich nicht." },
            ],
          },
        },
        {
          name: "11",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label:
              "Einen Radweg, der auch von landwirtschaftlichen Fahrzeugen befahren werden darf, würde ich …",
            options: [
              { key: "1", label: "ohne Einschränkung mit dem Rad nutzen." },
              { key: "2", label: "eher selten mit dem Rad nutzen." },
              { key: "3", label: "nie mit dem Rad nutzen." },
              { key: "4", label: "Weiß ich nicht." },
            ],
          },
        },
        {
          name: "12",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Einen Radweg, der auch von Bussen befahren werden darf, würde ich …",
            options: [
              { key: "1", label: "ohne Einschränkung mit dem Rad nutzen." },
              { key: "2", label: "eher selten mit dem Rad nutzen." },
              { key: "3", label: "nie mit dem Rad nutzen." },
              { key: "4", label: "Weiß ich nicht." },
            ],
          },
        },
      ],
    },
  ],
}
