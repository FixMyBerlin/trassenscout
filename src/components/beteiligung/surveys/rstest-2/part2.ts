import { fieldValidationEnum } from "@/src/components/beteiligung/shared/fieldvalidationEnum"
import { SurveyPart2 } from "@/src/components/beteiligung/shared/types"
import { mapData } from "@/src/components/beteiligung/surveys/rstest-2/mapData.const"

/**
 * Pilot: GeoCategoryMap loads live Planungsabschnitte from `/api/projects/rs23.json`
 * (requires Project.exportEnabled).
 */
export const part2Config: SurveyPart2 = {
  progressBarDefinition: 1,
  intro: {
    title: "RSTest 2 In dieser Umfrage steigen wir direkt ein: Ihre Hinweise und Wünsche",
    description: `Wenn Sie möchten, können Sie nun konkrete Hinweise zu den Planungsabschnitten abgeben.

## So geht's:
1. Wählen Sie auf der Karte einen Planungsabschnitt aus.
2. Wählen Sie eine Kategorie aus, zu der Ihr Hinweis passt.
3. Schreiben Sie Ihren Hinweis in das Textfeld.
4. Nach dem Speichern können Sie einen weiteren Hinweis formulieren oder die Beteiligung beenden.
`,
    type: "standard",
    buttons: [
      { action: "next", label: "Weiter", position: "right" },
      { action: "end", label: "Beteiligung beenden", position: "right" },
    ],
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
          name: "titleGeoCategory",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Planungsabschnitt und Kategorie auswählen." },
        },
        {
          name: "descriptionGeoCategory",
          componentType: "content",
          component: "SurveyMarkdown",
          props: {
            markdown:
              "Wählen Sie den Planungsabschnitt durch Klicken auf eine der Linien oder Flächen auf der Karte aus.",
          },
        },
        {
          name: "geometryCategoryId",
          componentType: "form",
          component: "hidden",
          props: {
            label: "Kürzel des ausgewählten Planungsabschnitts",
          },
        },
        {
          name: "geometryCategoryLabel",
          componentType: "form",
          component: "hidden",
          props: {
            label: "Planungsabschnitt",
          },
        },
        {
          name: "geometryCategory",
          componentType: "form",
          component: "SurveyGeoCategoryMapWithLegend",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: null,
          props: {
            label: "Planungsabschnitt auswählen",
            description:
              "Wählen Sie einen Planungsabschnitt aus, zu dem Sie einen Hinweis geben möchten.",
            mapProps: {
              mapData,
              additionalData: [
                {
                  dataKey: "geometryCategoryLabel",
                  propertyName: "subsectionSlug",
                  label: "Planungsabschnitt",
                },
              ],
              geoCategoryIdDefinition: {
                dataKey: "geometryCategoryId",
                propertyName: "subsectionSlug",
              },
              config: {
                // Frankfurt viewport — seed PAs survey-line-west/east + survey-poly sit here
                bounds: [8.68495, 50.103212, 8.793869, 50.148444],
                minZoom: 7,
                maxZoom: 16,
              },
            },
            legendProps: {
              items: {
                pa: {
                  label: "Planungsabschnitt",
                  color: "bg-[#2563eb]",
                  className: "h-[5px]",
                },
              },
            },
          },
        },
        {
          name: "category",
          componentType: "form",
          component: "SurveyRadiobuttonGroup",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Zu welchem Thema passt Ihr Hinweis?",
            options: [
              { key: "konflikte", label: "Mögliche Konflikte" },
              { key: "nutzung", label: "Nutzung" },
              { key: "streckenfuehrung", label: "Streckenführung" },
              { key: "umwelt", label: "Umwelt- und Naturschutz" },
              { key: "sonstiges", label: "Sonstiges" },
            ],
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
      ],
    },
  ],
}
