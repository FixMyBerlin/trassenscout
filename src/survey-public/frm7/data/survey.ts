import { TSurvey } from "src/survey-public/components/types"

export const surveyDefinition: TSurvey = {
  part: 1,
  version: 1,
  logoUrl: "https://radschnellweg8-lb-wn.de/logo.png",
  canonicalUrl: "https://frmtestetstest7.de/beteiligung/",
  pages: [
    {
      id: 1,
      title: { de: "Ihre Meinung ist gefragt FRM7 lalal" },
      description: {
        de: "Auf dem Weg zur Schule, Sportstätte und Arbeitsplatz, beim Wocheneinkauf oder dem Familienausflug – unser Ziel ist, dass der Radschnellweg von vielen Menschen angenommen wird.\n\nDeshalb interessieren uns die Ideen, Anmerkungen und Hinweise von Alltagsexpertinnen und -experten. Sie kennen sich vor Ort aus. Unterstützen Sie das Planungsteam dabei, den FRM 7 zum Erfolgsprojekt zu machen!\n\nDie Bürgerbeteiligung läuft noch bis zum 20.01.2024. Die Beantwortung dauert ca. 5-10 Minuten.",
      },
      buttons: [
        {
          label: { de: "Beteiligung starten" },
          color: "blue",
          onClick: { action: "nextPage" },
        },
      ],
    },
    {
      id: 2,
      title: { de: "Nutzung FRM7" },
      description: {
        de: "Zuerst möchten wir Ihnen einige Fragen zur Nutzung des FRM7 Ludwigsburg–Waiblingen stellen.",
      },
      questions: [
        {
          id: 1,
          label: { de: "Würden Sie den FRM7 nutzen?" },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              {
                id: 2,
                text: { de: "Nein" },
                help: {
                  de: "Warum nicht? Wir freuen uns, wenn Sie das Freifeldtext im späteren Teil „Weiteres Feedback“ nutzen, um uns Ihre Gründe zu nennen. Besten Dank!",
                },
              },
              {
                id: 3,
                text: {
                  de: "Ich bin ohnehin nicht zwischen Ludwigsburg und Waiblingen unterwegs.",
                },
              },
            ],
          },
        },
        {
          id: 2,
          label: { de: "Wie häufig würden Sie den FRM7 nutzen?" },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Täglich" } },
              { id: 2, text: { de: "Mehrmals pro Woche" } },
              { id: 3, text: { de: "Mehrmals im Monat" } },
              { id: 4, text: { de: "Seltener oder Nie" } },
            ],
          },
        },
        {
          id: 3,
          label: { de: "Für welche Zwecke würden Sie den FRM7 nutzen?" },
          component: "multipleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Einkaufen" } },
              { id: 2, text: { de: "Zur Arbeit/Schule pendeln" } },
              { id: 3, text: { de: "Sport/Freizeit" } },
              { id: 4, text: { de: "Anderes" } },
            ],
          },
        },
        {
          id: 4,
          label: { de: "Würden Sie durch den FRM7 häufiger aufs Auto verzichten?" },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              { id: 2, text: { de: "Nein" } },
              { id: 3, text: { de: "Ich verzichte bereits aufs Auto." } },
              { id: 4, text: { de: "Weiß nicht / Keine Angabe" } },
            ],
          },
        },
        {
          id: 5,
          label: {
            de: "Glauben Sie, dass andere durch den FRM7 häufiger aufs Auto verzichten würden?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              { id: 2, text: { de: "Nein" } },
              { id: 3, text: { de: "Weiß nicht / Keine Angabe" } },
            ],
          },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "pink", onClick: { action: "nextPage" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
    {
      id: 4,
      title: { de: "Gemeinsame Wegeführung" },
      description: {
        de: "Leider wird es nicht überall möglich sein, Wege zu bauen, die ausschließlich dem Radverkehr vorbehalten sind. Wir möchten gerne von Ihnen wissen, welche Folgen das für Ihre Nutzung des FRM7 hätte.",
      },
      questions: [
        {
          id: 9,
          label: {
            de: "Einen Weg, auf dem auch Fußverkehr zugelassen ist, würde ich …",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "ohne Einschränkung mit dem Rad nutzen." } },
              { id: 2, text: { de: "eher selten mit dem Rad nutzen." } },
              { id: 3, text: { de: "nie mit dem Rad nutzen." } },
              { id: 4, text: { de: "Weiß ich nicht." } },
            ],
          },
        },
        {
          id: 10,
          label: {
            de: "Eine Fahrradstraße, die auch von Kfz befahren werden darf, würde ich …",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "ohne Einschränkung mit dem Rad nutzen." } },
              { id: 2, text: { de: "eher selten mit dem Rad nutzen." } },
              { id: 3, text: { de: "nie mit dem Rad nutzen." } },
              { id: 4, text: { de: "Weiß ich nicht." } },
            ],
          },
        },
        {
          id: 11,
          label: {
            de: "Einen Radweg, der auch von landwirtschaftlichen Fahrzeugen befahren werden darf, würde ich …",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "ohne Einschränkung mit dem Rad nutzen." } },
              { id: 2, text: { de: "eher selten mit dem Rad nutzen." } },
              { id: 3, text: { de: "nie mit dem Rad nutzen." } },
              { id: 4, text: { de: "Weiß ich nicht." } },
            ],
          },
        },
        {
          id: 12,
          label: {
            de: "Einen Radweg, der auch von Bussen befahren werden darf, würde ich …",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "ohne Einschränkung mit dem Rad nutzen." } },
              { id: 2, text: { de: "eher selten mit dem Rad nutzen." } },
              { id: 3, text: { de: "nie mit dem Rad nutzen." } },
              { id: 4, text: { de: "Weiß ich nicht." } },
            ],
          },
        },
      ],
      buttons: [
        { label: { de: "Absenden" }, color: "pink", onClick: { action: "submit" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
  ],
}
