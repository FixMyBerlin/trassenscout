import { fieldValidationEnum } from "@/src/app/beteiligung-neu/_shared/fieldvalidationEnum"
import { SurveyPart2 } from "@/src/app/beteiligung-neu/_shared/types"
import { AnyFieldApi } from "@tanstack/react-form"

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 1,
  intro: {
    title: "RSTest 2-3 In dieser Umfrage steigen wir direkt ein: Ihre Hinweise und Wünsche",
    description:
      "Wenn Sie möchten, können Sie nun konkrete Hinweise zum Radschnellweg abgeben.\n\nDabei interessiert uns besonders, wenn sie Probleme an bestimmten Stellen des Radwegs sehen. Zum Beispiel: Gibt es Orte, die verbessert werden könnten? Oder gibt es Bereiche, die zu Problemen oder Konflikten, zum Beispiel mit zu Fußgehenden oder Autos führen könnten?\n\nIhre speziellen Hinweise, Kommentare oder Ideen sind für uns wichtig. Das hilft uns sehr weiter, den Radschnellweg noch besser zu planen.",
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
      id: "feedback",
      fields: [
        {
          name: "titleCategory",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Wir sind gespannt auf Ihre Hinweise." },
        },
        {
          name: "category",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
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
      id: "feedback2",
      fields: [
        {
          name: "titleLocation",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Was möchten Sie uns mitteilen?" },
        },
        {
          name: "descriptionLocation",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown:
              "Beschreiben Sie hier, was Ihnen wichtig ist. Beschreiben Sie die Situation oder das Problem so genau wie möglich. Es ist hilfreich, wenn Ihre Verbesserungsvorschläge leicht nachvollziehbar sind.",
          },
        },
        {
          name: "enableLocation",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "ja",
          props: {
            label: "Bezieht sich Ihr Hinweis auf eine konkrete Stelle entlang der Route?",
            options: [
              { key: "ja", label: "Ja" },
              { key: "nein", label: "Nein" },
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
          // here we use validators (not superrefine) as we need the isPristine state and as we do not have the pagehaserror problem here as it is the last page of the part tbd
          validators: {
            onSubmit: ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
              if (
                fieldApi.state.meta.isPristine &&
                fieldApi.form.getFieldValue("enableLocation") === "ja"
              ) {
                console.log({ fieldApi })
                return "Bitte wählen Sie einen Ort auf der Karte oder wählen sie oben, dass Sie keinen Ort angeben möchten."
              }
              return undefined
            },
          },
          component: "SurveySimpleMapWithLegend",
          validation: fieldValidationEnum["requiredLatLng"],
          defaultValue: {
            lat: 50.13115168672226,
            lng: 8.732094920912573,
          },
          props: {
            label: "Bitte markieren Sie den Ort, zu dem Sie etwas sagen möchten.",
            mapProps: {
              // tbd maptiler url per component or (only) in meta
              maptilerUrl:
                "https://api.maptiler.com/maps/a9cd44e7-43f6-4277-8ae0-d910f8162524/style.json",
              config: {
                bounds: [8.68495, 50.103212, 8.793869, 50.148444],
              },
            },
            legendProps: {
              Streckenführung: {
                variant1: {
                  label:
                    "Streckenführung A: Eher an großen Straßen auf Radwegen, getrennt von Autos",
                  color: "bg-[#006EFF]",
                  className: "h-[5px]",
                },
                variant2: {
                  label: "Streckenführung B: Eher in ruhigen Wohnstraßen, dafür zusammen mit Autos",
                  color: "bg-[#FFD900]",
                  className: "h-[5px]",
                },
                irrelevant: {
                  label: "Bereits beschlossene Strecke (außerhalb von Frankfurt)",
                  color: "bg-[#000]",
                  className: "h-[5px]",
                },
                blockedArea: {
                  label: "Gesperrt aus Gründen des Natur- oder Denkmalschutzes",
                  color: "opacity-70 stripe-background",
                  className: "h-5",
                },
              },
            },
          },
        },
        {
          name: "feedbackText",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Ihr Hinweis",
            // placeholder: "Beantworten Sie hier...",
          },
        },
      ],
    },
  ],
}
