import institutions_bboxes from "@/src/app/beteiligung/_radnetz-brandenbrug/institutions_bboxes.json"
import { mapData } from "@/src/app/beteiligung/_radnetz-brandenbrug/mapData.const"
import { fieldValidationEnum } from "@/src/app/beteiligung/_shared/fieldvalidationEnum"
import {
  geoCategorySetInitialBoundsDefinition,
  SurveyPart2,
} from "@/src/app/beteiligung/_shared/types"
import { AnyFieldApi } from "@tanstack/react-form"

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 5,
  intro: {
    type: "standard",
    title: "Ihre Anmerkungen",
    description: `Sie können im Folgenden konkrete Hinweise zum Zielnetzentwurf abgeben. Dabei interessieren uns zum einen wichtige anzubindende **Ziele**, die bei der Umlegung noch nicht ausreichend berücksichtigt wurden, wie bspw. Schulen oder Freizeiteinrichtungen. Zum anderen bitten wir um Vorschläge für **alternative Führungen**, z.B. wenn ein noch nicht berücksichtigter Weg besonders gut für den Radverkehr geeignet ist oder wenn bei der Umsetzung besondere **Hürden** zu erwarten sind, wie bspw. beim Grunderwerb. Wir bitten Sie, Ihre Hinweise auf Ihre jeweilige Gebietskörperschaft zu begrenzen.

## So geht's:
1. Wählen Sie auf der Karte eine Verbindung aus dem Netzentwurf aus.
2. Wählen Sie eine Kategorie aus, zu der Ihr Hinweis passt.
3. Optional können Sie über das Setzen eines zusätzlichen Pins Ihre Rückmeldung   noch konkreter verorten.
4. Schreiben Sie Ihren Hinweis in das Textfeld.
5. Nach dem Speichern Ihres Hinweises können Sie einen weiteren Hinweis   formulieren oder die Beteiligung beenden. Sie können beliebig viele Hinweise zu   verschiedenen Verbindungen geben.
    `,
    buttons: [
      { action: "next", label: "Weiter zur Abgabe von Hinweisen", position: "right" },
      { action: "end", label: "Beteiligung beenden", position: "right" },
    ],
  },
  buttonLabels: {
    next: "Weiter",
    back: "Zurück",
    submit: "Absenden & Beteiligung abschließen",
    again: "Absenden &  weiteren Hinweis geben",
  },
  pages: [
    {
      id: "1",
      fields: [
        {
          name: "titleGeoCategory",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Verbindung und Kategorie auswählen." },
        },
        {
          name: "descriptionGeoCategory",
          componentType: "content",
          component: "SurveyMarkdown",
          props: {
            markdown: `Wählen Sie die Verbindung durch Klicken auf eine der orangen Linien auf der Karte aus. Bedenken Sie dabei jedoch, dass sich Ihre Hinweise auf die Linien in Ihrem **Amts- oder Zuständigkeitsbereich** beschränken sollten. Bei Bedarf können Sie die Ansicht der Karte verschieben oder über “+/-” verkleinern oder vergrößern.`,
          },
        },
        // {
        //   name: "geometryCategoryId",
        //   componentType: "form",
        //   component: "hidden",
        //   props: { label: "ID der ausgewählten Haltestelle" },
        // },
        // ID der Linie
        {
          name: "20",
          componentType: "form",
          component: "hidden", // Using SurveyTextfield as a substitute for custom
          props: {
            label: "Id der Verbindung aus dem Radnetz-Konzept",
          },
        },
        // Bezeichnung der Linie
        {
          name: "30",
          componentType: "form",
          component: "hidden", // Using SurveyTextfield as a substitute for custom
          props: {
            label: "Verbindung (von - bis)",
          },
        },
        // Geometrie der Linie
        {
          name: "21",
          componentType: "form",
          component: "SurveyGeoCategoryMapWithLegend",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: null,
          props: {
            label: "Verbindung auswählen",
            description:
              "Wählen Sie eine Verbindung aus dem Radnetz-Konzept aus, zu der Sie einen Hinweis geben möchten.",
            mapProps: {
              mapData: mapData,
              setInitialBounds: {
                initialBoundsDefinition:
                  institutions_bboxes as unknown as geoCategorySetInitialBoundsDefinition,
                queryParameter: "id",
              },
              additionalData: [
                { dataKey: "30", propertyName: "from_name", label: "Verbindung (von - bis)" },
              ],
              geoCategoryIdDefinition: { dataKey: "20", propertyName: "Verbindung" },
              config: {
                bounds: [11.2688, 51.3592, 14.7655, 53.5586],
              },
            },
            legendProps: {
              items: {
                variant1: {
                  label: "foo",
                  color: "bg-[#006EFF]",
                  className: "h-[5px]",
                },
              },
            },
          },
        },
        // category
        {
          name: "22",
          componentType: "form",
          component: "SurveyRadiobuttonGroup",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Zu welchem Thema passt Ihr Hinweis?",
            options: [
              {
                key: "1",
                label: "Wichtiges anzubindendes Ziel",
                description:
                  "z.B. ein Schul- oder Freizeitstandort, der noch nicht ausreichend berücksichtigt ist",
              },
              {
                key: "2",
                label: "Vorschlag alternative Streckenführung",
                description:
                  "z.B. ein bestehender Weg/Radweg, der noch nicht berücksichtigt wurde, aber besonders geeignet ist (bspw. da er bereits gut angenommen wird)",
              },
              {
                key: "3",
                label: "Mögliche Hürden / besondere Herausforderungen",
                description: "z.B. zu erwartende Hindernisse beim Flächenerwerb",
              },
              { key: "4", label: "Anderes Thema" },
            ],
          },
        },
      ],
    },
    {
      id: "2",
      fields: [
        {
          name: "titleLocation",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Ihr Hinweis zu dieser Verbindung" },
        },
        // enableLocation
        {
          name: "23",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "1",
          props: {
            label:
              "Bezieht sich Ihr Hinweis auf eine konkrete Stelle entlang der ausgewählten Strecke?",
            options: [
              { key: "1", label: "Ja, ich möchte einen Pin auf der Karte setzen." },
              { key: "2", label: "Nein, ich möchte keine konkrete Stelle angeben." },
            ],
          },
        },
        // location
        {
          name: "24",
          componentType: "form",
          condition: {
            // this field is only shown if the user selected "ja" in the previous field
            fieldName: "23",
            conditionFn: (fieldValue) => fieldValue === "1",
          },
          validators: {
            onChange: ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
              if (fieldApi.state.meta.isPristine && fieldApi.form.getFieldValue("23") === "1") {
                console.log({ fieldApi })
                return "Bitte wählen Sie einen Ort auf der Karte oder wählen sie oben, dass Sie keinen Ort angeben möchten."
              }
              return undefined
            },
          },
          component: "SurveySimpleMapWithLegend",
          // this field is a conditionally required field but we handle it a bit differently than other conditionally required fields
          // as we want to keep the value in the form state even if enableLocation is "nein", even if we go back and forth, we do not delete the value
          // we delete the value manually in the SurveyMainPage submit function if enableLocation is "nein"
          validation: fieldValidationEnum["conditionalRequiredLatLng"],
          defaultValue: {
            lat: 52.32208889767472,
            lng: 13.465112375167422,
          },
          props: {
            label: "Wählen Sie die Stelle für Ihren Hinweis",
            mapProps: {
              config: {
                bounds: [
                  10.634343374814875, 50.99884540733649, 15.169801938047982, 53.769864338023126,
                ],
              },
            },
            legendProps: {
              "Linien aus dem Netzentwurf": {
                chosable: {
                  label: "Auswählbare Verbindungen",
                  color: "",
                  className: "stripe-background-vertical-orange h-[3.5px]",
                },
                areas: {
                  label: "Landkreisgrenzen",
                  color: "",
                  className: "h-[4px] stripe-background-vertical-pink",
                },
                borders: {
                  label: "Gemeindegrenzen",
                  color: "",
                  className: "h-[2px] stripe-background-vertical-pink-2",
                },
              },
              Straßentypen: {
                bund: {
                  label: "Bundesstraßen",
                  color: "bg-[#9FD3F4]",
                  className: "h-[6px]",
                },
                land: {
                  label: "Landesstraßen",
                  color: "bg-[#07b072]",
                  className: "h-[6px] opacity-70",
                },
                kreis: {
                  label: "Kreisstraßen",
                  color: "bg-[#cab007]",
                  className: "h-[6px] opacity-70",
                },
                highway: {
                  label: "Autobahn",
                  color: "bg-[#9B9FA1]",
                  className: "h-[6px]",
                },
              },
              "Quellen &  Ziele (werden erst ab Zoomstufe 11 oder 14 angezeigt)": {
                schools: {
                  label: "Schulen",
                  color: "bg-[#2880FB]",
                  className: "h-3 rounded-full !w-3",
                },
                kindergarden: {
                  label: "Kindergarten",
                  color: "bg-[#00B4CC]",
                  className: "h-3 rounded-full !w-3",
                },
                universities: {
                  label: "Universitäten",
                  color: "bg-[#B377FE]",
                  className: "h-3 rounded-full !w-3",
                },
                basics: {
                  label: "Grundversorgung",
                  color: "bg-[#F5814D]",
                  className: "h-3 rounded-full !w-3",
                },
                shopping: {
                  label: "Einkauf",
                  color: "bg-[#78E5D2]",
                  className: "h-3 rounded-full !w-3",
                },
                freetime: {
                  label: "Freizeit",
                  color: "bg-[#AEE66D]",
                  className: "h-3 rounded-full !w-3",
                },
              },
              "Radinfrastruktur Führungsformen (Bestand) (wird erst ab Zoomstufe 10 angezeigt)": {
                seperat: {
                  label: "Führung baul. abgesetzte von Kfz",
                  color: "bg-[#1353D1]",
                  className: "h-[3px]",
                },
                extra: {
                  label: "Führung eigenständig auf Fahrbahn",
                  color: "bg-[#009AE9]",
                  className: "h-[3px]",
                },
                pedestrian: {
                  label: "Führung mit Fußverkehr",
                  color: "",
                  className: "h-[3px] stripe-background-vertical-darkblue",
                },
                bike: {
                  label: "Führung mit Rad frei",
                  color: "",
                  className: "h-[3px] stripe-background-vertical-lightblue",
                },
                kfz: {
                  label: "Führung mit Kfz (explizit)",
                  color: "",
                  className: "h-[3px] stripe-background-vertical-blue",
                },
                unknown: {
                  label: "Führungsform unklar",
                  color: "",
                  className: "h-[3px] stripe-background-vertical-purple",
                },
              },
            },
          },
        },
        // feedbackTetxt
        {
          name: "25",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Ihre Anmerkung",
            placeholder: "Beantworten Sie hier...",
          },
        },
      ],
    },
  ],
}
