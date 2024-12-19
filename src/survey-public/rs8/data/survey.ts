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
    [9.194367, 48.893241],
    [9.204387, 48.893397],
    [9.20694, 48.892932],
    [9.207345, 48.892804],
    [9.207572, 48.892527],
    [9.209643, 48.892222],
    [9.209518, 48.891871],
    [9.211302, 48.891544],
    [9.213306, 48.891336],
    [9.214959, 48.891126],
    [9.215124, 48.891105],
    [9.215157, 48.891101],
    [9.215175, 48.891098],
    [9.240035, 48.887679],
    [9.240504, 48.887561],
    [9.243368, 48.886582],
    [9.243407, 48.88657],
    [9.243447, 48.886559],
    [9.243488, 48.88655],
    [9.243529, 48.886543],
    [9.243572, 48.886538],
    [9.243615, 48.886534],
    [9.243658, 48.886532],
    [9.244556, 48.886511],
    [9.244647, 48.886508],
    [9.244737, 48.886502],
    [9.245701, 48.886422],
    [9.245719, 48.886421],
    [9.245737, 48.886418],
    [9.245754, 48.886414],
    [9.245771, 48.88641],
    [9.245788, 48.886405],
    [9.245804, 48.8864],
    [9.24582, 48.886393],
    [9.245834, 48.886386],
    [9.245848, 48.886378],
    [9.245862, 48.88637],
    [9.245874, 48.886361],
    [9.245885, 48.886352],
    [9.245896, 48.886342],
    [9.245905, 48.886332],
    [9.245914, 48.886321],
    [9.245921, 48.88631],
    [9.245927, 48.886299],
    [9.245932, 48.886287],
    [9.245936, 48.886275],
    [9.245938, 48.886263],
    [9.24594, 48.886251],
    [9.24594, 48.886239],
    [9.245939, 48.886227],
    [9.245914, 48.886049],
    [9.245913, 48.886037],
    [9.245913, 48.886024],
    [9.245915, 48.886012],
    [9.245917, 48.885999],
    [9.245922, 48.885987],
    [9.245927, 48.885975],
    [9.245934, 48.885963],
    [9.245942, 48.885952],
    [9.245951, 48.885941],
    [9.245961, 48.88593],
    [9.245972, 48.88592],
    [9.245984, 48.885911],
    [9.245998, 48.885902],
    [9.246012, 48.885894],
    [9.246027, 48.885886],
    [9.246043, 48.885879],
    [9.246059, 48.885873],
    [9.246076, 48.885868],
    [9.246613, 48.885713],
    [9.246649, 48.885702],
    [9.246684, 48.88569],
    [9.246718, 48.885676],
    [9.24675, 48.885661],
    [9.246781, 48.885644],
    [9.246811, 48.885627],
    [9.24684, 48.885609],
    [9.246872, 48.885593],
    [9.246904, 48.885578],
    [9.246938, 48.885564],
    [9.246941, 48.885563],
    [9.305, 48.838441],
    [9.304997, 48.838436],
    [9.304601, 48.838093],
    [9.304812, 48.837885],
    [9.304872, 48.83786],
    [9.304889, 48.837856],
    [9.304906, 48.837851],
    [9.304922, 48.837846],
    [9.304937, 48.837839],
    [9.304952, 48.837833],
    [9.304967, 48.837825],
    [9.30498, 48.837817],
    [9.304993, 48.837809],
    [9.305005, 48.837799],
    [9.305015, 48.83779],
    [9.305025, 48.83778],
    [9.305034, 48.837769],
    [9.305042, 48.837759],
    [9.305048, 48.837747],
    [9.305054, 48.837736],
    [9.305058, 48.837724],
    [9.305307, 48.837136],
    [9.304794, 48.835689],
    [9.304766, 48.835575],
  ],
}
