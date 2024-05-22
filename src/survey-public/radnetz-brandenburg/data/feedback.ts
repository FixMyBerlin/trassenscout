import { TFeedback } from "src/survey-public/components/types"

export const feedbackDefinition: TFeedback = {
  part: 2,
  pages: [
    {
      id: 1,
      title: { de: "Verbindung und Kategorie auswählen" },
      description: {
        de: "Wählen Sie die **Verbindung durch klicken** auf eine der orangen Linien auf der Karte aus. Bitte beziehen Sie Ihr Feedback auf die Linien, die in Ihrem Amtsbereich oder Zuständigkeitsbereich verlaufen.",
      },
      questions: [
        // ID der Linie
        {
          id: 20,
          label: {
            de: "Wählen Sie die Verbindung aus dem Radnetz zu der Sie einen Hinweis geben wollen!",
          },
          component: "custom",
        },
        // Geometrie der Linie
        {
          id: 21,
          label: {
            de: "Gemetrie der Linie",
          },
          component: "custom",
        },
        {
          id: 22,
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
          id: 23,
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
          id: 24,
          label: { de: "Bitte markieren Sie den Ort, zu dem Sie etwas sagen möchten." },
          component: "map",
          props: {
            marker: {
              lat: 52.32208889767472,
              lng: 13.465112375167422,
            },
            config: {
              bounds: [
                10.942243895210964, 53.676969136097426, 13.465112375167422, 52.32208889767472,
              ],
            },
            legend: {
              "Linien aus dem Netzentwurf": {
                chosable: {
                  label: {
                    de: "Auswählbare Verbindungen",
                  },
                  color: "bg-[#E97E30]",
                  className: "h-[5px]",
                },
                borders: {
                  label: {
                    de: "Gemeindegrenzen",
                  },
                  color: "",
                  className: "h-[3px] stripe-background-vertical-orange",
                },
                areas: {
                  label: { de: "Landkreise" },
                  color: "bg-[#E135F8]",
                  className: "h-[1.5px]",
                },
              },
              "Quellen &  Ziele": {
                education: {
                  label: {
                    de: "Bildung",
                  },
                  color: "bg-[#326BD7]",
                  className: "h-5 rounded-full",
                },
                schools: {
                  label: {
                    de: "Schulen",
                  },
                  color: "bg-[#2880FB]",
                  className: "h-5 rounded-full",
                },
                basics: {
                  label: { de: "Grundversorgung" },
                  color: "bg-[#F5814D]",
                  className: "h-5 rounded-full",
                },
                freetime: {
                  label: { de: "Freizeit" },
                  color: "bg-[#AEE66D]",
                  className: "h-5 rounded-full",
                },
                kindergarden: {
                  label: { de: "Kindergarten" },
                  color: "bg-[#00B4CC]",
                  className: "h-5 rounded-full",
                },
                universities: {
                  label: { de: "Universitäten" },
                  color: "bg-[#B377FE]",
                  className: "h-5 rounded-full",
                },
                shopping: {
                  label: { de: "Einkauf" },
                  color: "bg-[#78E5D2]",
                  className: "h-5 rounded-full",
                },
              },
              "Radinfrastruktur Führungsformen (Bestand)": {
                seperat: {
                  label: {
                    de: "Führung baul. abgesetzte von Kfz",
                  },
                  color: "bg-[#1353D1]",
                  className: "h-[5px]",
                },
                extra: {
                  label: {
                    de: "Führung eigenständig auf Fahrbahn ",
                  },
                  color: "bg-[#009AE9]",
                  className: "h-[5px]",
                },
                pedestrian: {
                  label: {
                    de: "Führung  mit Fußverkehr ",
                  },
                  color: "",
                  className: "h-[5px] stripe-background-vertical-darkblue",
                },
                bike: {
                  label: {
                    de: "Führung  mit Rad frei ",
                  },
                  color: "",
                  className: "h-[5px] stripe-background-vertical-lightblue",
                },
                kfz: {
                  label: {
                    de: "Führung mit Kfz (explizit)",
                  },
                  color: "",
                  className: "h-[5px] stripe-background-vertical-blue",
                },
                unknown: {
                  label: {
                    de: "Führungsform unklar",
                  },
                  color: "",
                  className: "h-[5px] stripe-background-vertical-purple",
                },
              },
            },
          },
        },
        {
          id: 25,
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
