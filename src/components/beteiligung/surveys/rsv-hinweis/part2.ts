import { AnyFieldApi } from "@tanstack/react-form"
import { fieldValidationEnum } from "@/src/components/beteiligung/shared/fieldvalidationEnum"
import { SurveyPart2 } from "@/src/components/beteiligung/shared/types"
import { mapData } from "@/src/components/beteiligung/surveys/rsv-hinweis/mapData.const"

/** Default map bounds: Germany (steckbrief deep links can override via `?mapStart=zoom/lat/lng`) */
const germanyBounds: [number, number, number, number] = [5.8, 47.2, 15.1, 55.1]
/** Below z7 so fitBounds / zoom-out can show all of Germany (Berlin + Leipzig, etc.) */
const germanyMinZoom = 5
const germanyMaxZoomGeoCategory = 16
const germanyMaxZoomPin = 13

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 1,
  intro: {
    type: "standard",
    title: "Hinweis zu Radschnellverbindungen",
    description: `Willkommen beim digitalen Beteiligungsportal für Radschnellverbindungen in Deutschland. Über dieses Formular können Sie als Projektleitung Hinweise mit räumlichem Bezug auf Grundlage des vorliegenden Radschnellverbindungsnetzes zügig, systematisch und transparent an FixMyCity übermitteln.

## Zweck und Ziel

Dieses Formular ergänzt die Plattform [radschnellverbindungen.info](https://radschnellverbindungen.info/steckbriefe/), auf der Sie eine Übersicht der aktuell geplanten Radschnellverbindungen sowie deren Trassenverläufe beziehungsweise -korridore in Form von Steckbriefen vorfinden.

Ziel dieses Formulars im Trassenscout ist eine möglichst effiziente Kommunikation und Steuerung der Planung.

## Was können Sie mitteilen?

Sie können unter anderem Hinweise übermitteln zu:

- dem aktuellen Projektstand oder geplanten nächsten Schritten,
- Trassenverläufen, Korridoren und räumlichen Besonderheiten,
- fachlichen, organisatorischen oder technischen Anforderungen.

## Hinweise zur Übermittlung

Bitte füllen Sie das Formular vollständig aus. Nach dem Absenden wird Ihr Hinweis direkt im System erfasst und FixMyCity zur Auswertung bereitgestellt.

[Datenschutzhinweis](https://radschnellverbindungen.info/datenschutz): Alle angegebenen personenbezogenen Daten werden ausschließlich für die Durchführung und Nachbereitung dieses Hinweisverfahrens gemäß DSGVO verarbeitet.

Mit dem Aufrufen des Formulars stimme ich der Datenschutzerklärung zu. Die Daten werden gemäß DSGVO verarbeitet und nur für die Durchführung dieses digitalen Hinweisverfahrens gespeichert.

Sind Sie eine **Projektleitung** einer **Radschnellverbindung**?

Dann klicken Sie bitte auf den untenstehenden Button, um einen Hinweis abzugeben.`,
    buttons: [{ action: "next", label: "Weiter", position: "right", color: "primaryColor" }],
  },
  buttonLabels: {
    next: "Weiter",
    back: "Zurück",
    submit: "Hinweis absenden",
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
          props: { title: "Hinweis zur Radschnellverbindung" },
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
            label: "Dokumente hochladen",
          },
        },
        {
          name: "uploadsDescription",
          componentType: "form",
          component: "SurveyTextarea",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: { label: "Beschreibung der Dokumente" },
        },
      ],
    },
    {
      id: "2",
      fields: [
        {
          name: "titleContact",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Ihre Kontaktdaten" },
        },
        {
          name: "contact",
          componentType: "form",
          component: "SurveyTextfield",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: { label: "Name einer zuständigen Kontaktperson", autoComplete: "name" },
        },
        {
          name: "phone",
          componentType: "form",
          component: "SurveyTextfield",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Telefonnummer für Rückfragen",
            type: "tel",
            autoComplete: "tel",
          },
        },
        {
          name: "email",
          componentType: "form",
          component: "SurveyTextfield",
          validation: fieldValidationEnum["requiredEmailString"],
          defaultValue: "",
          props: {
            label: "E-Mail-Adresse",
            type: "email",
            autoComplete: "email",
          },
        },
        {
          name: "personalMessage",
          componentType: "form",
          component: "SurveyTextarea",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: { label: "Persönliche Nachricht" },
        },
        {
          name: "declaration",
          componentType: "form",
          component: "SurveyCheckbox",
          validation: fieldValidationEnum["requiredTrueBoolean"],
          defaultValue: false,
          props: {
            label: "Erklärung",
            itemLabel:
              "Ich bestätige, dass ich zur Abgabe dieses Hinweises im Namen der angegebenen Stelle/Behörde berechtigt bin.",
          },
        },
      ],
    },
  ],
}
