import { AnyFieldApi } from "@tanstack/react-form"
import { fieldValidationEnum } from "@/src/components/beteiligung/shared/fieldvalidationEnum"
import { SurveyPart2 } from "@/src/components/beteiligung/shared/types"
import { mapData } from "@/src/components/beteiligung/surveys/radschnellverbindungen-info-feedback/mapData.const"

/** Default map bounds: Germany (steckbrief deep links can override via `?mapStart=zoom/lat/lng`) */
const germanyBounds: [number, number, number, number] = [5.8, 47.2, 15.1, 55.1]
/** Below z7 so fitBounds / zoom-out can show all of Germany (Berlin + Leipzig, etc.) */
const germanyMinZoom = 5
const germanyMaxZoomGeoCategory = 16
const germanyMaxZoomPin = 13

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 1,
  intro: {
    title: "Hinweise zu Radschnellverbindungen",
    description: `Vielen Dank, dass Sie sich beteiligen. Mit Ihrem Hinweis helfen Sie, die Informationen zu den geplanten Radschnellverbindungen auf [radschnellverbindungen.info](https://radschnellverbindungen.info/steckbriefe/) zu verbessern.

## So geht's:
1. Wählen Sie auf der Karte die Strecke aus, zu der Ihr Hinweis gehört.
2. Optional können Sie zusätzlich einen Pin setzen, wenn sich Ihr Hinweis auf eine konkrete Stelle bezieht — oder ohne genaue Ortsangabe fortfahren.
3. Schreiben Sie Ihren Hinweis und laden Sie bei Bedarf eine Datei hoch.
4. Hinterlassen Sie Ihren Namen, Ihre Rolle und Ihre E-Mail-Adresse für Rückfragen.
`,
    type: "standard",
    buttons: [{ action: "next", label: "Weiter", position: "right", color: "primaryColor" }],
  },
  buttonLabels: {
    next: "Weiter",
    back: "Zurück",
    submit: "Absenden",
    again: "Ich möchte noch einen Hinweis abgeben",
  },
  pages: [
    {
      id: "1",
      fields: [
        {
          name: "titleLocation",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Verorten Sie Ihren Hinweis" },
        },
        {
          name: "descriptionLocation",
          componentType: "content",
          component: "SurveyMarkdown",
          props: {
            markdown:
              "Wählen Sie zuerst die eingezeichnete Strecke auf der Karte aus, zu der Ihr Hinweis gehört.",
          },
        },
        {
          name: "geometryCategoryId",
          componentType: "form",
          component: "hidden",
          props: {
            label: "Kürzel der ausgewählten Strecke",
          },
        },
        {
          name: "geometryCategoryLabel",
          componentType: "form",
          component: "hidden",
          props: {
            label: "Strecke",
          },
        },
        {
          name: "geometryCategory",
          componentType: "form",
          component: "SurveyGeoCategoryMapWithLegend",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: null,
          props: {
            label: "Strecke auswählen",
            description:
              "Klicken Sie auf eine eingezeichnete Strecke auf der Karte. Die Karte können Sie bei Bedarf verschieben oder über „+/-“ verkleinern bzw. vergrößern.",
            mapProps: {
              mapData,
              additionalData: [
                {
                  dataKey: "geometryCategoryLabel",
                  propertyName: "subsectionSlug",
                  label: "Strecke",
                },
              ],
              geoCategoryIdDefinition: {
                dataKey: "geometryCategoryId",
                propertyName: "subsectionSlug",
              },
              infoPanelText: "Wählen Sie eine Strecke aus, zu der Sie einen Hinweis geben möchten.",
              config: {
                bounds: germanyBounds,
                minZoom: germanyMinZoom,
                maxZoom: germanyMaxZoomGeoCategory,
              },
            },
            legendProps: {
              Legende: {
                pa: {
                  label: "Strecke",
                  color: "bg-[#34D399]",
                  className: "h-[5px]",
                },
              },
            },
          },
        },
        {
          name: "enableLocation",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "ja",
          props: {
            label: "Bezieht sich Ihr Hinweis auf eine konkrete Stelle entlang der Strecke?",
            options: [
              { key: "ja", label: "Ja, ich möchte einen Pin auf der Karte setzen." },
              { key: "nein", label: "Nein, ich möchte keine konkrete Stelle angeben." },
            ],
          },
        },
        {
          name: "location",
          componentType: "form",
          condition: {
            fieldName: "enableLocation",
            conditionFn: (fieldValue) => fieldValue === "ja",
          },
          validators: {
            onChange: ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
              if (
                fieldApi.state.meta.isPristine &&
                fieldApi.form.getFieldValue("enableLocation") === "ja"
              ) {
                return "Bitte setzen Sie einen Pin auf der Karte oder wählen Sie oben, dass Sie keine konkrete Stelle angeben möchten."
              }
              return undefined
            },
          },
          component: "SurveySimpleMapWithLegend",
          validation: fieldValidationEnum["conditionalRequiredLatLng"],
          defaultValue: {
            lat: 51.1657,
            lng: 10.4515,
          },
          props: {
            label: "Pin setzen",
            description:
              "Klicken Sie auf die Karte oder verschieben Sie den Pin. Bei Wechsel der Strecke wird der Pin neu gesetzt.",
            mapProps: {
              mapData,
              config: {
                bounds: germanyBounds,
                minZoom: germanyMinZoom,
                maxZoom: germanyMaxZoomPin,
              },
            },
            legendProps: {
              Legende: {
                pa: {
                  label: "Ausgewählte Strecke",
                  color: "bg-[#34D399]",
                  className: "h-[5px]",
                },
                pin: {
                  label: "Ihr Pin",
                  color: "bg-[#34D399]",
                  className: "size-2! rounded-full",
                },
              },
            },
          },
        },
      ],
    },
    {
      id: "2",
      fields: [
        {
          name: "titleFeedback",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Was möchten Sie uns mitteilen?" },
        },
        {
          name: "feedbackText",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Ihr Hinweis",
          },
        },
        {
          name: "uploads",
          componentType: "form",
          component: "SurveyUploadField",
          validation: fieldValidationEnum["optionalArrayOfNumber"],
          defaultValue: [],
          props: {
            label: "Datei hochladen (optional)",
          },
        },
      ],
    },
    {
      id: "3",
      fields: [
        {
          name: "titleContact",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Ihre Kontaktdaten" },
        },
        {
          name: "descriptionContact",
          componentType: "content",
          component: "SurveyMarkdown",
          props: {
            markdown:
              "Damit wir bei Rückfragen nachfragen können, benötigen wir Ihren vollständigen Namen, Ihre Rolle und Ihre E-Mail-Adresse.",
          },
        },
        {
          name: "contact",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Vollständiger Name",
            autoComplete: "name",
          },
        },
        {
          name: "role",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Rolle",
            description: "z. B. Anwohner:in, Verwaltung, Planung, Interessensvertretung",
          },
        },
        {
          name: "email",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredEmailString"],
          defaultValue: "",
          props: {
            label: "E-Mail-Adresse",
            type: "email",
            autoComplete: "email",
          },
        },
      ],
    },
  ],
}
