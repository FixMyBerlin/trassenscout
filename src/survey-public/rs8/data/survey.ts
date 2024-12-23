import { TSurvey } from "../../components/types"

export const surveyDefinition: TSurvey = {
  part: 1,
  version: 1,
  logoUrl: "https://radschnellweg8-lb-wn.de/logo.png",
  canonicalUrl: "https://radschnellweg8-lb-wn.de/beteiligung/",
  maptilerUrl: "https://api.maptiler.com/maps/b09268b1-91d0-42e2-9518-321a1a94738f/style.json",
  primaryColor: "#e5007d",
  darkColor: "#1e293b",
  lightColor: "#ffcce8",
  geometryCategoryType: "polygon",
  pages: [
    {
      id: 1,
      title: { de: "Ihre Meinung ist gefragt" },
      description: {
        de: "Auf dem Weg zur Schule, Sportstätte und Arbeitsplatz, beim Wocheneinkauf oder dem Familienausflug – unser Ziel ist, dass der Radschnellweg von vielen Menschen angenommen wird.\n\nDeshalb interessieren uns die Ideen, Anmerkungen und Hinweise von Alltagsexpertinnen und -experten. Sie kennen sich vor Ort aus. Unterstützen Sie das Planungsteam dabei, den RS 8 zum Erfolgsprojekt zu machen!\n\nDie Bürgerbeteiligung läuft noch bis zum 20.08.2023. Die Beantwortung dauert ca. 5-10 Minuten.",
      },
      buttons: [
        {
          label: { de: "Beteiligung starten" },
          color: "primaryColor",
          onClick: { action: "nextPage" },
        },
      ],
    },
    {
      id: 2,
      title: { de: "Nutzung" },
      description: {
        de: "Zuerst möchten wir Ihnen einige Fragen zur Nutzung des RS 8 Ludwigsburg–Waiblingen stellen.",
      },
      questions: [
        {
          id: 1,
          label: { de: "Würden Sie den RS 8 nutzen?" },
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
          label: { de: "Wie häufig würden Sie den RS 8 nutzen?" },
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
          label: { de: "Für welche Zwecke würden Sie den RS 8 nutzen?" },
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
          label: { de: "Würden Sie durch den RS 8 häufiger aufs Auto verzichten?" },
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
            de: "Glauben Sie, dass andere durch den RS 8 häufiger aufs Auto verzichten würden?",
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
        { label: { de: "Weiter" }, color: "primaryColor", onClick: { action: "nextPage" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
    {
      id: 3,
      title: { de: "Ausstattung" },
      description: {
        de: "Wie wichtig sind Ihnen folgende Ausstattungsmerkmale bei Radschnellwegen?",
      },
      questions: [
        {
          id: 6,
          label: { de: "Wie wichtig ist Ihnen die Beleuchtung des RS 8?" },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Eher wichtig" } },
              { id: 2, text: { de: "Weniger wichtig" } },
              { id: 3, text: { de: "Weiß nicht" } },
            ],
          },
        },
        {
          id: 7,
          label: { de: "Wie wichtig sind Ihnen Rastmöglichkeiten entlang der Strecke?" },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Eher wichtig" } },
              { id: 2, text: { de: "Weniger wichtig" } },
              { id: 3, text: { de: "Weiß nicht" } },
            ],
          },
        },
        {
          id: 8,
          label: {
            de: "Wie wichtig sind Ihnen Reparatursäulen (Luftpumpe, Werkzeug) entlang der Strecke?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Eher wichtig" } },
              { id: 2, text: { de: "Weniger wichtig" } },
              { id: 3, text: { de: "Weiß nicht" } },
            ],
          },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "primaryColor", onClick: { action: "nextPage" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
    {
      id: 4,
      title: { de: "Gemeinsame Wegeführung" },
      description: {
        de: "Leider wird es nicht überall möglich sein, Wege zu bauen, die ausschließlich dem Radverkehr vorbehalten sind. Wir möchten gerne von Ihnen wissen, welche Folgen das für Ihre Nutzung des RS 8 hätte.",
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
        { label: { de: "Absenden" }, color: "primaryColor", onClick: { action: "submit" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
  ],
  geometryFallback: [
    [
      [9.2698335172187, 48.87869228199153],
      [9.256061001130519, 48.88504929293569],
      [9.227720381469425, 48.884441132262054],
      [9.22427374222076, 48.86710825996391],
      [9.268512977686129, 48.85081249852618],
      [9.296452214861716, 48.86745626706548],
      [9.284795357958927, 48.88365491457324],
      [9.2698335172187, 48.87869228199153],
    ],
  ],
}
