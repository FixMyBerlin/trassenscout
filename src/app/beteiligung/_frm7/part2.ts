import { fieldValidationEnum } from "@/src/app/beteiligung/_shared/fieldvalidationEnum"
import { SurveyPart2 } from "@/src/app/beteiligung/_shared/types"
import { AnyFieldApi } from "@tanstack/react-form"

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 5,
  intro: {
    type: "standard",
    title: "Ihre Hinweise und Wünsche",
    description:
      "Teil 1 der Beteiligung ist abgeschlossen. Wenn Sie möchten, können Sie nun konkrete Hinweise zum Radschnellweg abgeben.\n\nDabei interessiert uns besonders, wenn sie Probleme an bestimmten Stellen des Radwegs sehen. Zum Beispiel: Gibt es Orte, die verbessert werden könnten? Oder gibt es Bereiche, die zu Problemen oder Konflikten, zum Beispiel mit zu Fußgehenden oder Autos führen könnten?\n\nIhre speziellen Hinweise, Kommentare oder Ideen sind für uns wichtig. Das hilft uns sehr weiter, den Radschnellweg noch besser zu planen.",
    buttons: [
      { action: "next", label: "Weiter", position: "right" },
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
      id: "feedback",
      fields: [
        {
          name: "titleCategory",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Wir sind gespannt auf Ihre Hinweise." },
        },
        {
          name: "descriptionCategory",
          componentType: "content",
          component: "SurveyMarkdown",
          props: {
            markdown:
              "Hier können Sie dem Planungsteam konkrete Ideen, Anregungen und Hinweise zum FRM7 geben. Sie können einen oder mehrere Hinweise abgeben. Wenn Sie mehrere Hinweise haben, können Sie diese nacheinander bearbeiten. Beginnen Sie nun mit dem ersten.",
          },
        },
        {
          name: "21",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Zu welchem Thema passt Ihr Hinweis?",
            options: [
              { key: "1", label: "Mögliche Konflikte" },
              { key: "2", label: "Nutzung" },
              { key: "3", label: "Streckenführung" },
              { key: "4", label: "Umwelt- und Naturschutz" },
              { key: "5", label: "Sonstiges" },
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
          name: "22",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "1",
          props: {
            label: "Bezieht sich Ihr Hinweis auf eine konkrete Stelle entlang der Route?",
            options: [
              { key: "1", label: "Ja" },
              { key: "2", label: "Nein" },
            ],
          },
        },
        {
          name: "23",
          componentType: "form",
          condition: {
            // this field is only shown if the user selected "ja" in the previous field
            fieldName: "22",
            conditionFn: (fieldValue) => fieldValue === "1",
          },
          validators: {
            onChange: ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
              if (fieldApi.state.meta.isPristine && fieldApi.form.getFieldValue("22") === "1") {
                console.log({ fieldApi })
                return "Bitte wählen Sie einen Ort auf der Karte oder wählen sie oben, dass Sie keinen Ort angeben möchten."
              }
              return undefined
            },
          },
          component: "SurveySimpleMapWithLegend",
          validation: fieldValidationEnum["conditionalRequiredLatLng"],
          defaultValue: {
            lat: 50.13115168672226,
            lng: 8.732094920912573,
          },
          props: {
            label: "Bitte markieren Sie den Ort, zu dem Sie etwas sagen möchten.",
            mapProps: {
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
                  color: "bg-black",
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
          name: "34",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Was möchten Sie uns mitteilen?",
            description:
              "Beschreiben Sie hier, was Ihnen wichtig ist. Beschreiben Sie die Situation oder das Problem so genau wie möglich. Es ist hilfreich, wenn Ihre Verbesserungsvorschläge leicht nachvollziehbar sind.",
            placeholder: "Beantworten Sie hier...",
          },
        },
      ],
    },
  ],
}
