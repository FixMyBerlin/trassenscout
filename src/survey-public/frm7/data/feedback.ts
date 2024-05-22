import { TFeedback } from "src/survey-public/components/types"

export const feedbackDefinition: TFeedback = {
  part: 2,
  pages: [
    {
      id: 1,
      title: { de: "Wir sind gespannt auf Ihre Hinweise. " },
      description: {
        de: "Hier können Sie dem Planungsteam konkrete Ideen, Anregungen und Hinweise zum FRM7 geben. Sie können einen oder mehrere Hinweise abgeben. Wenn Sie mehrere Hinweise haben, können Sie diese nacheinander bearbeiten. Beginnen Sie nun mit dem ersten.",
      },
      questions: [
        {
          id: 21,
          label: { de: "Zu welchem Thema passt Ihr Hinweis?" },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Mögliche Konflikte" } },
              { id: 2, text: { de: "Nutzung" } },
              { id: 3, text: { de: "Streckenführung" } },
              { id: 4, text: { de: "Umwelt- und Naturschutz" } },
              { id: 5, text: { de: "Sonstiges" } },
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
      id: 2,
      title: { de: "Was möchten Sie uns mitteilen?" },
      description: {
        de: "Beschreiben Sie hier, was Ihnen wichtig ist. Beschreiben Sie die Situation oder das Problem so genau wie möglich. Es ist hilfreich, wenn Ihre Verbesserungsvorschläge leicht nachvollziehbar sind.",
      },
      questions: [
        {
          id: 22,
          label: {
            de: "Bezieht sich Ihr Hinweis auf eine konkrete Stelle entlang der Route?",
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
          label: { de: "Bitte markieren Sie den Ort, zu dem Sie etwas sagen möchten." },
          component: "map",
          props: {
            marker: {
              lat: 50.13115168672226,
              lng: 8.732094920912573,
            },
            config: {
              bounds: [8.68495, 50.103212, 8.793869, 50.148444],
            },
            legend: {
              Streckenführung: {
                variant1: {
                  label: {
                    de: "Streckenführung A: Eher an großen Straßen auf Radwegen, getrennt von Autos",
                  },
                  color: "bg-[#006EFF]",
                  className: "h-[5px]",
                },
                variant2: {
                  label: {
                    de: "Streckenführung B: Eher in ruhigen Wohnstraßen, dafür zusammen mit Autos",
                  },
                  color: "bg-[#FFD900]",
                  className: "h-[5px]",
                },
                irrelevant: {
                  label: { de: "Bereits beschlossene Strecke (außerhalb von Frankfurt)" },
                  color: "bg-[#000]",
                  className: "h-[5px]",
                },
                blockedArea: {
                  label: { de: "Gesperrt aus Gründen des Natur- oder Denkmalschutzes" },
                  color: "opacity-70 stripe-background",
                  className: "h-5",
                },
              },
            },
          },
        },
        {
          id: 34,
          label: { de: "Ihr Hinweis" },
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
          color: "primaryColor",
          onClick: { action: "submit" },
        },
      ],
    },
  ],
}
