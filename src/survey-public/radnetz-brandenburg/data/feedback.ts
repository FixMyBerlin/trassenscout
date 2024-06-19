import { TFeedback } from "src/survey-public/components/types"

export const feedbackDefinition: TFeedback = {
  part: 2,
  pages: [
    {
      id: 1,
      title: { de: "Verbindung und Kategorie auswählen" },
      description: {
        de: `Wählen Sie die Verbindung durch Klicken auf eine der orangenen Linien auf der Karte aus. Bedenken Sie dabei jedoch, dass sich Ihre Hinweise auf die Linien in Ihrem **Amts- oder Zuständigkeitsbereich** beschränken sollten. Bei Bedarf können Sie die Ansicht der Karte verschieben oder über “+/-” verkleinern oder vergrößern.`,
      },
      questions: [
        // ID der Linie
        {
          id: 20,
          label: {
            de: "Wählen Sie eine Verbindung aus dem Radnetz aus, zu der Sie Rückmeldung geben möchten.",
          },
          component: "custom",
        },
        // Bezeichnung der Linie
        {
          id: 30,
          label: {
            de: "Bezeichnung der Linie mit Start und Ziel",
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
          label: { de: "Zu welchem Thema passt Ihr Feedback?" },
          component: "singleResponse",
          props: {
            responses: [
              {
                id: 1,
                help: {
                  de: "z.B. ein Schul- oder Freizeitstandort, der noch nicht ausreichend berücksichtigt ist",
                },
                text: { de: "Wichtiges anzubindendes Ziel" },
              },
              {
                id: 2,
                help: {
                  de: "z.B. ein bestehender Weg/Radweg, der noch nicht berücksichtigt wurde, aber besonders geeignet ist  (bspw. da er bereits gut angenommen wird)",
                },
                text: { de: "Vorschlag alternative Streckenführung" },
              },
              {
                id: 3,
                help: { de: "z.B. zu erwartende Hindernisse beim Flächenerwerb" },
                text: { de: "Mögliche Hürden / besondere Herausforderungen" },
              },
              { id: 4, text: { de: "Anderes Thema" } },
            ],
          },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "primaryColor", onClick: { action: "nextPage" } },
      ],
    },
    {
      id: 2,
      title: { de: "Ihr Hinweis zu dieser Verbindung" },
      description: {
        de: "",
      },
      questions: [
        {
          id: 23,
          label: {
            de: "Bezieht sich Ihr Hinweis auf eine konkrete Stelle entlang der ausgewählten Strecke?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja, ich möchte einen Pin auf der Karte setzen." } },
              { id: 2, text: { de: "Nein, ich möchte keine konkrete Stelle angeben." } },
            ],
          },
        },
        {
          id: 24,
          label: { de: "Wählen Sie die Stelle für Ihren Hinweis" },
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
          label: { de: "Ihre Anmerkung" },
          component: "text",
          props: {
            placeholder: { de: "Beantworten Sie hier..." },
            caption: { de: "max. 2000 Zeichen" },
          },
        },
      ],
      buttons: [
        {
          label: { de: "Speichern & weiteren Hinweis hinzufügen" },
          color: "primaryColor",
          onClick: { action: "submit" },
        },
        {
          label: { de: "Speichern & Beteiligung beenden" },
          color: "primaryColor",
          onClick: { action: "submit" },
        },
      ],
    },
  ],
}
