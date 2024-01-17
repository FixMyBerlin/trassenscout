import { TFeedback } from "../../components/types"

// todo refs readme

export const feedbackDefinition: TFeedback = {
  part: 2,
  pages: [
    {
      id: 1,
      title: { de: "Wir sind gespannt auf Ihre Anmerkungen." },
      description: {
        de: "Hier können Sie dem Planungsteam konkrete Ideen, Anregungen und Hinweise zum RS 8 mit auf den Weg geben. Sie können mehrere Anmerkungen abgeben, bitte geben Sie diese einzeln ab.",
      },
      questions: [
        {
          id: 21,
          label: { de: "Zu welchem Thema passt Ihr Feedback?" },

          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Nutzung" } },
              { id: 2, text: { de: "Streckenführung" } },
              { id: 3, text: { de: "Zubringer" } },
              { id: 4, text: { de: "Mögliche Konflikte" } },
              { id: 5, text: { de: "Umwelt- und Naturschutz" } },
              { id: 6, text: { de: "Sonstiges" } },
            ],
          },
        },
        {
          id: 22,
          label: {
            de: "Bezieht sich Ihr Feedback auf eine konkrete Stelle entlang der Route?",
          },
          component: "singleResponse",

          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              { id: 2, text: { de: "Nein" } },
            ],
          },
        },
        {
          id: 23,

          label: { de: "Markieren Sie die Stelle, zu der Sie etwas sagen möchten." },
          component: "map",
          props: {
            maptilerStyleUrl:
              "https://api.maptiler.com/maps/b09268b1-91d0-42e2-9518-321a1a94738f/style.json",
            marker: {
              lat: 48.87405710508672,
              lng: 9.271044583540359,
            },
            config: {
              bounds: [9.387312714501604, 48.90390202531458, 9.103949029818097, 48.81629635563661],
            },
          },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "primaryColor", onClick: { action: "nextPage" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
    {
      id: 2,
      title: { de: "Ihr Hinweis" },
      description: {
        de: "Formulieren Sie hier Ihre Gedanken, Ideen, Anregungen oder Wünsche",
      },
      questions: [
        {
          id: 31,
          label: { de: "Kategorie" },
          component: "custom",
        },
        {
          id: 32,
          label: { de: "Ausgewählte Stelle" },
          component: "custom",
        },
        {
          id: 33,
          label: { de: "Wählen Sie die Stelle für Ihr Feedback" },
          component: "custom",
        },
        {
          id: 34,
          label: { de: "Was gefällt Ihnen hier besonders?" },
          component: "text",

          props: {
            placeholder: { de: "Beantworten Sie hier..." },
            caption: { de: "Max. 2000 Zeichen" },
          },
        },
        {
          id: 35,
          label: { de: "Was wünschen Sie sich?" },
          component: "text",

          props: {
            placeholder: { de: "Beantworten Sie hier..." },
            caption: { de: "Max. 2000 Zeichen" },
          },
        },
      ],
      buttons: [
        {
          label: { de: "Absenden & Beteiligung abschließen" },
          color: "primaryColor",
          onClick: { action: "submit" },
        },
        {
          label: { de: "Absenden &  weiteren Hinweis geben" },
          color: "white",
          onClick: { action: "submit" },
        },
      ],
    },
  ],
}
