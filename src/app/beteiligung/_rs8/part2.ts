import { fieldValidationEnum } from "@/src/app/beteiligung/_shared/fieldvalidationEnum"
import { SurveyPart2 } from "@/src/app/beteiligung/_shared/types"
import { AnyFieldApi } from "@tanstack/react-form"

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 5,
  intro: {
    type: "standard",
    title: "Ihre Hinweise und Wünsche",
    description:
      "Wenn Sie möchten, können Sie uns noch weiteres Feedback z. B. zu einem konkreten Thema oder einer bestimmten Stelle zukommen lassen. Drücken Sie dazu bitte auf “Weitere Hinweise geben”. Dort haben Sie auch die Möglichkeit, Hinweise mit Pin auf einer interaktiven Karte zu verorten. Haben Sie noch konkrete Hinweise zu Themen vor Ort?",
    buttons: [
      { action: "next", label: "Ja, ich habe noch Hinweise", position: "right" },
      { action: "end", label: "Nein, ich möchte die Umfrage beenden", position: "right" },
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
          name: "titleCategory",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Wir sind gespannt auf Ihre Anmerkungen." },
        },
        {
          name: "descriptionCategory",
          componentType: "content",
          component: "SurveyMarkdown",
          props: {
            markdown:
              "Hier können Sie dem Planungsteam konkrete Ideen, Anregungen und Hinweise zum RS 8 mit auf den Weg geben. Sie können mehrere Anmerkungen abgeben, bitte geben Sie diese einzeln ab.",
          },
        },
        // category
        {
          name: "21",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Zu welchem Thema passt Ihr Feedback?",
            options: [
              { key: "1", label: "Nutzung" },
              { key: "2", label: "Streckenführung" },
              { key: "3", label: "Zubringer" },
              { key: "4", label: "Mögliche Konflikte" },
              { key: "5", label: "Umwelt- und Naturschutz" },
              { key: "6", label: "Sonstiges" },
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
          props: { title: "Ihr Hinweis" },
        },
        {
          name: "descriptionLocation",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown: "Formulieren Sie hier Ihre Gedanken, Ideen, Anregungen oder Wünsche.",
          },
        },
        // enableLocation
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
        // location
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
          // this field is a conditionally required field but we handle it a bit differently than other conditionally required fields
          // as we want to keep the value in the form state even if enableLocation is "nein", even if we go back and forth, we do not delete the value
          // we delete the value manually in the SurveyMainPage submit function if enableLocation is "nein"
          validation: fieldValidationEnum["conditionalRequiredLatLng"],
          defaultValue: {
            lat: 48.87405710508672,
            lng: 9.271044583540359,
          },
          props: {
            label: "Markieren Sie die Stelle, zu der Sie etwas sagen möchten.",
            mapProps: {
              // tbd maptiler url per component or (only) in meta
              maptilerUrl:
                "https://api.maptiler.com/maps/b09268b1-91d0-42e2-9518-321a1a94738f/style.json",
              config: {
                bounds: [
                  9.103949029818097, 48.81629635563661, 9.387312714501604, 48.90390202531458,
                ],
              },
            },
            legendProps: {
              Streckenführung: {
                variant1: {
                  label: "foo",
                  color: "bg-[#006EFF]",
                  className: "h-[5px]",
                },
              },
            },
          },
        },
        // feedbackText and feedbackText2: originally one of these was required, but this is not relevant for the backend so we made both optional here for simplicity
        //  feedbackText
        {
          name: "34",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Was gefällt Ihnen hier besonders?",
            placeholder: "Beantworten Sie hier...",
          },
        },
        // feedbackText2
        {
          name: "35",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Was wünschen Sie sich?",
            placeholder: "Beantworten Sie hier...",
          },
        },
      ],
    },
  ],
}
