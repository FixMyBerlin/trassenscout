import { TFeedback } from "src/participation/data/types"

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
            marker: {
              lat: 50.131816894372264,
              lng: 8.695815249074684,
            },
            layerStyles: [
              {
                id: "RS8--allsections-luecke-copy",
                type: "line",

                layout: { visibility: "visible" },
                paint: {
                  "line-color": "#2C62A9",
                  "line-width": 3,
                  "line-dasharray": [2, 2],
                },
                filter: ["all", ["==", "planungsabschnitt", "2A"]],
              },
              {
                id: "RS8--allsections",
                type: "line",

                layout: { visibility: "visible" },
                paint: { "line-color": "#2C62A9", "line-width": 3 },
                filter: ["all", ["!=", "planungsabschnitt", "2A"]],
              },
              {
                id: "RS8--section4",
                type: "line",

                layout: { visibility: "none" },
                paint: {
                  "line-color": "#2C62A9",
                  "line-width": 7,
                  "line-opacity": 1,
                },
                filter: ["all", ["==", "teilstrecke", 4]],
              },
              {
                id: "RS8--section3",
                type: "line",

                layout: { visibility: "none" },
                paint: { "line-color": "#2C62A9", "line-width": 5 },
                filter: ["all", ["==", "teilstrecke", 3]],
              },
              {
                id: "RS8--section1",
                type: "line",

                layout: { visibility: "none" },
                paint: { "line-color": "#2C62A9", "line-width": 5 },
                filter: ["any", ["==", "teilstrecke", 1], ["==", "planungsabschnitt", "2B"]],
              },
              {
                id: "RS8--section1-luecke",
                type: "line",

                layout: { visibility: "none" },
                paint: {
                  "line-color": "#2c62a9",
                  "line-width": 7,
                  "line-dasharray": [2, 2],
                },
                filter: ["all", ["==", "planungsabschnitt", "2A"]],
              },
              {
                id: "RS8--section2",
                type: "line",

                layout: { visibility: "none" },
                paint: { "line-color": "#2c62a9", "line-width": 5 },
                filter: ["all", ["==", "teilstrecke", 2], ["!=", "planungsabschnitt", "2A"]],
              },
            ],
            projectGeometry: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    coordinates: [
                      [
                        [8.624785639994087, 50.087541366888246],
                        [8.650674936761675, 50.09307804646028],
                        [8.668598296062441, 50.100743162180805],
                        [8.686521655363123, 50.106704071063945],
                        [8.695815249074684, 50.131816894372264],
                        [8.703117358419235, 50.14458107476918],
                        [8.726351342697654, 50.14543189904731],
                        [8.71440243649775, 50.15478996722965],
                        [8.73099813955389, 50.16372096043952],
                        [8.742947045754647, 50.15946831461474],
                      ],
                    ],
                    type: "MultiLineString",
                  },
                },
              ],
            },
            config: {
              zoom: 2,
              bounds: [8.576990015191768, 50.18115285304344, 8.791982825789262, 50.084578531515405],
              longitude: 8.695815249074684,
              latitude: 50.131816894372264,
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
