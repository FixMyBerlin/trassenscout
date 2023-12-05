import { TFeedback } from "src/survey-public/components/types"

export const feedbackDefinition: TFeedback = {
  part: 2,
  pages: [
    {
      id: 1,
      title: { de: "Wir sind gespannt auf Ihre Anmerkungen. FRM7" },
      description: {
        de: "Hier können Sie dem Planungsteam konkrete Ideen, Anregungen und Hinweise zum RS 8 mit auf den Weg geben. Sie können mehrere Anmerkungen abgeben, bitte geben Sie diese einzeln ab.",
      },
      questions: [
        {
          id: 21,
          label: { de: "Zu welchem Thema passt Ihr Feedback?" },
          evaluationRef: "feedback-category",
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Nutzung" } },
              { id: 2, text: { de: "Streckenführung" } },
              { id: 3, text: { de: "Zubringer" } },
              { id: 4, text: { de: "Mögliche Konflikte" } },
              { id: 7, text: { de: "Mögliche Konflikte FRM7" } },
              { id: 8, text: { de: "Noch ein Thema" } },
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
          evaluationRef: "is-feedback-location",
          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              { id: 2, text: { de: "Nein" } },
            ],
          },
        },
        {
          id: 23,
          evaluationRef: "feedback-location",
          label: { de: "Markieren Sie die Stelle, zu der Sie etwas sagen möchten." },
          component: "map",
          props: {
            maptilerStyleUrl:
              "https://api.maptiler.com/maps/a9cd44e7-43f6-4277-8ae0-d910f8162524/style.json",
            marker: {
              lat: 50.13810478491584,
              lng: 8.774882307368216,
            },
            config: {
              zoom: 2,
              bounds: [8.576990015191768, 50.18115285304344, 8.791982825789262, 50.084578531515405],
              longitude: 8.774882307368216,
              latitude: 50.13810478491584,
              boundsPadding: 20,
            },
          },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "pink", onClick: { action: "nextPage" } },
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
          evaluationRef: "feedback-usertext",
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
          color: "pink",
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
