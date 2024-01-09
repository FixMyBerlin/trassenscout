import { TFeedback } from "src/survey-public/components/types"

export const feedbackDefinition: TFeedback = {
  part: 2,
  pages: [
    {
      id: 1,
      title: { de: "Wir sind gespannt auf Ihre Hinweise. " },
      description: {
        de: "Hier können Sie dem Planungsteam konkrete Ideen, Anregungen und Hinweise zum FRM 7 geben. Sie können einen oder mehrere Hinweise abgeben. Wenn Sie mehrere Hinweise haben, können Sie diese nacheinander bearbeiten. Beginnen Sie nun mit dem ersten.",
      },
      questions: [
        {
          id: 21,
          label: { de: "Zu welchem Thema passt Ihr Hinweis?" },
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
            maptilerStyleUrl:
              "https://api.maptiler.com/maps/a9cd44e7-43f6-4277-8ae0-d910f8162524/style.json",
            marker: {
              lat: 50.13115168672226,
              lng: 8.732094920912573,
            },
            config: {
              bounds: [8.68495, 50.103212, 8.793869, 50.148444],
              pinColor: "#D60F3D",
              // todo frm7
            },
            legend: {
              variant1: {
                label: {
                  de: "Streckenführung A: Eher an großen Straßen auf Radwegen, getrennt von Autos.",
                },
                color: "bg-[#006EFF]", // todo frm7
                height: "h-[5px]",
                shape: "line",
              },
              variant2: {
                label: {
                  de: "Streckenführung B: Eher in ruhigen Wohnstraßen, dafür zusammen mit Autos.",
                },
                color: "bg-[#FFD900]", // todo frm7
                height: "h-[5px]",
                shape: "line",
              },
              irrelevant: {
                label: { de: "Bereits beschlossene Strecke (außerhalb von Frankfurt)" },
                color: "bg-[#000]", // todo frm7
                height: "h-[5px]",
                shape: "line",
              },
              blockedArea: {
                label: { de: "Gesperrt aus Gründen des Natur- oder Denkmalschutzes" },
                color: "bg-[#DA1616] opacity-70", // todo frm7
                height: "h-5",
                shape: "line",
              },
              pois: {
                label: { de: "Orte für Bildung, Arbeit, Freizeit und mehr." },
                color: "bg-[#000]", // todo frm7
                height: "h-4",
                shape: "dot",
              },
            },
          },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "red", onClick: { action: "nextPage" } },
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
          color: "red",
          onClick: { action: "submit" },
        },
        {
          label: { de: "Absenden &  weiteren Hinweis geben" },
          color: "red",
          onClick: { action: "submit" },
        },
      ],
    },
  ],
}
