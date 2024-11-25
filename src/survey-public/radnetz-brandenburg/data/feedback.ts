import { TFeedback } from "@/src/survey-public/components/types"

export const feedbackDefinition: TFeedback = {
  part: 2,
  pages: [
    {
      id: 1,
      title: { de: "Verbindung und Kategorie auswählen" },
      description: {
        de: `Wählen Sie die Verbindung durch Klicken auf eine der orangen Linien auf der Karte aus. Bedenken Sie dabei jedoch, dass sich Ihre Hinweise auf die Linien in Ihrem **Amts- oder Zuständigkeitsbereich** beschränken sollten. Bei Bedarf können Sie die Ansicht der Karte verschieben oder über “+/-” verkleinern oder vergrößern.`,
      },
      questions: [
        // ID der Linie
        {
          id: 20,
          label: {
            de: "Wählen Sie eine Verbindung aus dem Radnetz-Konzept aus, zu der Sie einen Hinweis geben möchten.",
          },
          component: "custom",
        },
        // Bezeichnung der Linie
        {
          id: 30,
          label: {
            de: "Verbindung (von - bis)",
          },
          component: "custom",
        },
        // Geometrie der Linie
        {
          id: 21,
          label: {
            de: "Geometrie der Linie",
          },
          component: "custom",
        },
        {
          id: 22,
          label: { de: "Zu welchem Thema passt Ihr Hinweis?" },
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
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
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
                  color: "",
                  className: "stripe-background-vertical-orange h-[3.5px]",
                },
                areas: {
                  label: { de: "Landkreisgrenzen" },
                  color: "",
                  className: "h-[4px] stripe-background-vertical-pink",
                },
                borders: {
                  label: {
                    de: "Gemeindegrenzen",
                  },
                  color: "",
                  className: "h-[2px] stripe-background-vertical-pink-2",
                },
              },
              Straßentypen: {
                bund: {
                  label: {
                    de: "Bundesstraßen",
                  },
                  color: "bg-[#9FD3F4]",
                  className: "h-[6px]",
                },
                land: {
                  label: {
                    de: "Landesstraßen",
                  },
                  color: "bg-[#07b072]",
                  className: "h-[6px] opacity-70",
                },
                kreis: {
                  label: {
                    de: "Kreisstraßen",
                  },
                  color: "bg-[#cab007]",
                  className: "h-[6px] opacity-70",
                },
                highway: {
                  label: {
                    de: "Autobahn",
                  },
                  color: "bg-[#9B9FA1]",
                  className: "h-[6px]",
                },
              },
              "Quellen &  Ziele (werden erst ab Zoomstufe 11 oder 14 angezeigt)": {
                schools: {
                  label: {
                    de: "Schulen",
                  },
                  color: "bg-[#2880FB]",
                  className: "h-3 rounded-full !w-3",
                },
                kindergarden: {
                  label: { de: "Kindergarten" },
                  color: "bg-[#00B4CC]",
                  className: "h-3 rounded-full !w-3",
                },
                universities: {
                  label: { de: "Universitäten" },
                  color: "bg-[#B377FE]",
                  className: "h-3 rounded-full !w-3",
                },
                basics: {
                  label: { de: "Grundversorgung" },
                  color: "bg-[#F5814D]",
                  className: "h-3 rounded-full !w-3",
                },
                shopping: {
                  label: { de: "Einkauf" },
                  color: "bg-[#78E5D2]",
                  className: "h-3 rounded-full !w-3",
                },
                freetime: {
                  label: { de: "Freizeit" },
                  color: "bg-[#AEE66D]",
                  className: "h-3 rounded-full !w-3",
                },
              },
              "Radinfrastruktur Führungsformen (Bestand) (wird erst ab Zoomstufe 10 angezeigt)": {
                seperat: {
                  label: {
                    de: "Führung baul. abgesetzte von Kfz",
                  },
                  color: "bg-[#1353D1]",
                  className: "h-[3px]",
                },
                extra: {
                  label: {
                    de: "Führung eigenständig auf Fahrbahn ",
                  },
                  color: "bg-[#009AE9]",
                  className: "h-[3px]",
                },
                pedestrian: {
                  label: {
                    de: "Führung  mit Fußverkehr ",
                  },
                  color: "",
                  className: "h-[3px] stripe-background-vertical-darkblue",
                },
                bike: {
                  label: {
                    de: "Führung  mit Rad frei ",
                  },
                  color: "",
                  className: "h-[3px] stripe-background-vertical-lightblue",
                },
                kfz: {
                  label: {
                    de: "Führung mit Kfz (explizit)",
                  },
                  color: "",
                  className: "h-[3px] stripe-background-vertical-blue",
                },
                unknown: {
                  label: {
                    de: "Führungsform unklar",
                  },
                  color: "",
                  className: "h-[3px] stripe-background-vertical-purple",
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
            caption: { de: "max. 5000 Zeichen" },
            maxLength: 5000,
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
          color: "white",
          onClick: { action: "submit" },
        },
      ],
    },
  ],
}
