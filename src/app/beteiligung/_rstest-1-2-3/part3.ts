import { fieldValidationEnum } from "@/src/app/beteiligung/_shared/fieldvalidationEnum"
import { SurveyPart1and3 } from "@/src/app/beteiligung/_shared/types"
import { isDev } from "@/src/core/utils"
import { AnyFieldApi } from "@tanstack/react-form"

export const part3Config: SurveyPart1and3 = {
  progressBarDefinition: 6,
  intro: {
    type: "standard",
    title: "Persönliche Angaben",
    description:
      "Teil 2 von 3 der Beteiligung ist abgeschlossen. Wenn Sie möchten, können Sie noch folgende Fragen beantworten.",
    buttons: [
      { action: "next", label: "Weiter", position: "right" },
      { action: "end", label: "Beteiligung beenden", position: "right" },
      // {
      //   action: "part1",
      //   label: "Zurück zum ersten Teil der Umfrage",
      //   position: "left",
      //   color: "white",
      // },
      // { action: "part2", label: "Zurück zu den Hinweisen" },
    ],
  },
  buttonLabels: { next: "Weiter", back: "Zurück", submit: "Absenden" },
  pages: [
    {
      id: "1",
      fields: [
        {
          name: "titlePerson",
          component: "SurveyPageTitle",
          componentType: "content",
          props: {
            title: "Und jetzt noch etwas über Sie",
          },
        },
        {
          name: "firstName",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Vorname",
          },
        },
        {
          name: "lastName",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Nachname",
          },
        },
        {
          name: "isTest",
          component: "SurveyCheckbox",
          componentType: "form",
          validation: fieldValidationEnum["requiredBoolean"],
          defaultValue: false,
          props: {
            label: "Möchten Sie diese Checkbox aktivieren?",
            itemLabel: "Ja, ich möchte zustimmen.",
            description: "Dies ist eine Testcheckbox",
          },
        },
        {
          name: "conditionCase1A",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "nein",
          props: {
            label: "Case 1 A: Fahren Sie Fahrrad?",
            description:
              "Wenn ja, dann erscheint das Textfeld  Case 1 A UND IST REQUIRED. Der Wert des koditionalen Feldes wird gelöscht wenn das Feld abgewählt wird.",
            options: [
              {
                key: "ja",
                description: "wenn ja ausgewäht wird erscheint Textfeld Conditional Case 1 A",
                label: "Ja",
              },
              {
                key: "nein",
                description: "wenn nein ausgewäht wird erscheint kein Textfeld",
                label: "Nein",
              },
            ],
          },
          // this deletes the value of conditionalCase1A if condition is not met
          // there are cases that we want to keep the value of the conditional field even if it the field disappears (see location); we have a workaround for location (we delete the field manually on submit what is easy as location exsits in all survey so far but not ideal)
          listeners: {
            onChange: ({ fieldApi }) => {
              isDev &&
                console.log(
                  `${fieldApi.name} has changed to: ${fieldApi.state.value} --> resetting conditionalCase1A`,
                )
              fieldApi.state.value === "nein" &&
                fieldApi.form.setFieldValue("conditionalCase1A", "") // reset value if condition is not met
            },
          },
        },
        {
          name: "conditionalCase1A",
          component: "SurveyTextfield",
          componentType: "form",
          condition: {
            fieldName: "conditionCase1A",
            conditionFn: (fieldValue) => fieldValue === "ja",
          },
          validators: {
            onChangeListenTo: ["conditionCase1A"],
            onSubmit: ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
              if (
                fieldApi.form.getFieldValue("conditionCase1A") === "ja" &&
                fieldApi.state.value.trim() === ""
              ) {
                return "Bitte antworten Sie auf diese Frage oder sagen Sie oben NEIN."
              }
              return undefined
            },
          },
          validation: fieldValidationEnum["conditionalRequiredString"],
          // example for superrefine - works exacly like the field validator
          // maybe we delete superrefine option in config as for now it does not add functionality tbd
          // zodSuperRefine: (data: any, ctx: z.RefinementCtx) => {
          //   if (data.conditionCase1A === "ja" && data.conditionalCase1A.trim() === "") {
          //     ctx.addIssue({
          //       path: ["conditionalCase1A"],
          //       code: z.ZodIssueCode.custom,
          //       message: "Pflichtfeld wenn 'ja' gewählt wurde.",
          //     })
          //   }
          // },
          defaultValue: "",
          props: {
            label: "Case 1 A: Welches Fahrrad fahren Sie?",
          },
        },
        {
          name: "conditionCase1B",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "nein",
          props: {
            label: "Case 1 B: Fahren Sie Auto?",
            description:
              "Wenn ja, dann erscheint das Textfeld  Case 1 B, ist aber optional. Der Wert des koditionalen Feldes wird gespeichert, auch wenn das Feld abgewählt wird.",
            options: [
              {
                key: "ja",
                description: "wenn ja ausgewäht wird erscheint Textfeld Conditional Case 1 B",
                label: "Ja",
              },
              {
                key: "nein",
                description: "wenn nein ausgewäht wird erscheint kein Textfeld",
                label: "Nein",
              },
            ],
          },
        },
        {
          name: "conditionalCase1B",
          component: "SurveyTextfield",
          componentType: "form",
          condition: {
            fieldName: "conditionCase1B",
            conditionFn: (fieldValue) => fieldValue === "ja",
          },
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Case 1 B: Welches Auto fahren Sie?",
          },
        },
        {
          name: "conditionCase2",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Case 2: Was trifft auf Sie zu?",
            description:
              "Wenn Feld nihct im UI erscheint, also Kondition nicht erfüllt ist, wird 'nicht sicher' im konditionalen Feld gespeichert",
            options: [
              {
                key: "manchmal",
                label: "Ich fahre manchmal Fahrrad",
                description:
                  "wenn min. eins von den ersten 3 ausgewäht wird, erscheint Textfeld Conditional Case 2",
              },
              {
                key: "oft",
                label: "Ich fahre oft Fahrrad",
                description:
                  "wenn min. eins von den ersten 3 ausgewäht wird, erscheint Textfeld Conditional Case 2",
              },
              {
                key: "sehr_oft",
                description:
                  "wenn min. eins von den ersten 3 ausgewäht wird, erscheint Textfeld Conditional Case 2",
                label: "Ich fahre sehr oft Fahrrad",
              },
              {
                key: "nie",
                label: "Ich fahre nie Fahrrad",
              },
            ],
          },
          listeners: {
            onChange: ({ fieldApi }) => {
              console.log(
                `${fieldApi.name} has changed to: ${fieldApi.state.value} --> sets conditionalCase2 to specific value`,
              )
              if (
                !["manchmal", "oft", "sehr_oft"].some((key) => fieldApi.state.value?.includes(key))
              ) {
                fieldApi.form.setFieldValue("conditionalCase2", "nicht sicher")
              } else {
                fieldApi.form.setFieldValue("conditionalCase2", "")
              } // reset value if condition is not met
            },
          },
        },
        {
          name: "conditionalCase2",
          component: "SurveyTextfield",
          componentType: "form",
          condition: {
            fieldName: "conditionCase2",
            conditionFn: (fieldValue) => {
              // @ts-expect-error we know value is an array
              return ["manchmal", "oft", "sehr_oft"].some((key) => fieldValue?.includes(key))
            },
          },
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Case 2: Wie sicher fühlen Sie sich beim Radfahren?",
          },
        },
        {
          name: "conditionCase3",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "nein",
          props: {
            label: "Case 3: Fahren Sie Fahrrad oder Auto?",
            options: [
              {
                key: "fahrrad",
                label: "Fahrrad",
              },
              {
                key: "auto",
                label: "Auto",
              },
            ],
          },
        },
        {
          name: "conditionalCase3",
          component: "SurveyTextfield",
          componentType: "form",
          condition: {
            fieldName: "conditionCase3",
            conditionFn: (fieldValue) => fieldValue === "fahrrad",
          },

          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Welches Fahrrad fahren Sie?",
          },
        },
        {
          name: "conditionalSecondCase3",
          component: "SurveyTextfield",
          componentType: "form",
          condition: {
            fieldName: "conditionCase3",
            conditionFn: (fieldValue) => fieldValue === "auto",
          },

          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Welches Auto fahren Sie?",
          },
        },
      ],
    },
    {
      id: "2",
      fields: [
        {
          name: "titlePerson2",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Nutzung und Gestaltung FRM7" },
        },
        {
          name: "descriptionPerson2",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown:
              "In diesem Teil geht es um den Radschnellweg. Wir möchten von Ihnen wissen, ob und wie Sie den Radweg nutzen würden und wie dieser gestaltet sein soll.",
          },
        },
        {
          name: "nutzen2",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Würden Sie den FRM7 nutzen?",
            options: [
              { key: "ja", label: "Ja" },
              { key: "nein", label: "Nein" },
              {
                key: "irrelevant",
                label: "Ich bin ohnehin nicht zwischen Frankfurt und Hanau unterwegs.",
              },
            ],
          },
        },
        {
          name: "oftNutzen2",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Wie oft würden Sie den FRM7 nutzen?",
            options: [
              { key: "täglich", label: "Täglich oder fast täglich" },
              { key: "mehrmals_pro_woche", label: "Mehrmals pro Woche" },
              { key: "mehrmals_pro_monat", label: "Mehrmals im Monat" },
              { key: "nie", label: "Seltener oder Nie" },
            ],
          },
        },
      ],
    },
  ],
}
