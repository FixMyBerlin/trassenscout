import { AnyFieldApi } from "@tanstack/react-form"
import { fieldValidationEnum } from "@/src/components/beteiligung/shared/fieldvalidationEnum"
import { SurveyPart2 } from "@/src/components/beteiligung/shared/types"

const germanyBounds: [number, number, number, number] = [5.8, 47.2, 15.1, 55.1]

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 1,
  intro: {
    type: "standard",
    title: "Maßnahmenmeldung Radschnellverbindungen",
    description: `Willkommen beim digitalen Beteiligungsportal für Radschnellverbindungen in Deutschland. Über dieses Formular können Sie als Projektleitung Maßnahmen und Hinweise mit räumlichem Bezug auf Grundlage des vorliegenden Radschnellverbindungsnetzes zügig, systematisch und transparent an FixMyCity melden.

## Zweck und Ziel

Dieses Formular ergänzt die Plattform [radschnellverbindungen.info](https://radschnellverbindungen.info/steckbriefe/), auf der Sie eine Übersicht der aktuell geplanten Radschnellverbindungen sowie deren Trassenverläufe beziehungsweise -korridore in Form von Steckbriefen vorfinden.

Ziel dieses Formulars im Trassenscout ist eine möglichst effiziente Kommunikation und Steuerung der Planung.

## Was können Sie melden?

Sie können unter anderem Hinweise übermitteln zu:

- dem aktuellen Projektstand oder geplanten nächsten Schritten,
- Trassenverläufen, Korridoren und räumlichen Besonderheiten,
- fachlichen, organisatorischen oder technischen Anforderungen.

## Hinweise zur Übermittlung

Bitte füllen Sie das Formular vollständig aus. Nach dem Absenden wird Ihre Meldung direkt im System erfasst und FixMyCity zur Auswertung bereitgestellt.

[Datenschutzhinweis](https://radschnellverbindungen.info/datenschutz): Alle angegebenen personenbezogenen Daten werden ausschließlich für die Durchführung und Nachbereitung dieses Meldeverfahrens gemäß DSGVO verarbeitet.

Mit dem Aufrufen des Formulars stimme ich der Datenschutzerklärung zu. Die Daten werden gemäß DSGVO verarbeitet und nur für die Durchführung dieses digitalen Meldeverfahrens gespeichert.

Sind Sie eine **Projektleitung** einer **Radschnellverbindung**?

Dann klicken Sie bitte auf den untenstehenden Button, um eine Maßnahme zu melden.`,
    buttons: [
      { action: "next", label: "Maßnahme melden", position: "right", color: "primaryColor" },
    ],
  },
  buttonLabels: {
    next: "Weiter",
    back: "Zurück",
    submit: "Maßnahme absenden",
  },
  pages: [
    {
      id: "massnahmenmeldung",
      fields: [
        {
          name: "title",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Maßnahmenmeldung Radschnellverbindungen" },
        },
        {
          name: "description",
          componentType: "content",
          component: "SurveyMarkdown",
          props: {
            markdown:
              "Bitte nutzen Sie das Formular für jeweils nur eine Maßnahmenmeldung. Sie können weitere Maßnahmenmeldungen in einem weiteren Schritt hinzufügen und absenden.",
          },
        },
        {
          name: "rsvName",
          componentType: "form",
          component: "SurveyTextfield",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: { label: "Name der Radschnellverbindung" },
        },
        {
          name: "category",
          componentType: "form",
          component: "SurveyRadiobuttonGroup",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Kategorie des Anliegens",
            description:
              "Bitte wählen Sie die Kategorie, die Ihr Anliegen am besten beschreibt. Weitere Aspekte können Sie im Beschreibungstext erläutern.",
            options: [
              {
                key: "projectProfileInformation",
                label:
                  "Projektsteckbrief und Projektinformationen (z. B. Aktualisierungen oder Ergänzungen für den Steckbrief auf radschnellverbindungen.info)",
              },
              {
                key: "routeCorridorVariants",
                label:
                  "Trassenverlauf, Korridor oder Varianten (z. B. Hinweise zu geplanten Verläufen)",
              },
              {
                key: "networkConnections",
                label:
                  "Netzverknüpfungen und Anschlüsse (z. B. Übergänge zu anderen Radverkehrsverbindungen, Bahnhöfen, ÖPNV)",
              },
              {
                key: "crossingsNodesConflictPoints",
                label:
                  "Querungen, Knotenpunkte und Konfliktstellen (z. B. Hinweise zu Kreuzungen, Unterführungen, Gefahrenstellen)",
              },
              {
                key: "planningStandardsFeasibility",
                label:
                  "Planung, bauliche und technische Standards und Machbarkeit (z. B. Qualitätsstandards, Sicherheitsausstattung wie Beleuchtung, Breite der Wege)",
              },
              {
                key: "landEnvironmentPermitting",
                label:
                  "Flächen, Umwelt und Genehmigung (z. B. Eigentum, Flächenverfügbarkeit, Natur- und Denkmalschutz)",
              },
              {
                key: "participationCommunication",
                label:
                  "Beteiligung und Kommunikation (z. B. Beteiligungsformate, relevante Akteur:innen, Kommunikationsbedarf)",
              },
              {
                key: "dataMapsSpatialRepresentation",
                label:
                  "Daten, Karten und räumliche Darstellung (z. B. Korrekturen oder Ergänzungen zu Karten, Geodaten, Lageplänen)",
              },
              { key: "other", label: "Sonstiges / Allgemeiner Hinweis" },
            ],
          },
        },
        {
          name: "existingPlanningSection",
          componentType: "form",
          component: "SurveyRadiobuttonGroup",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Bezieht sich Ihre Meldung auf einen bestehenden Planungsabschnitt?",
            options: [
              { key: "ja", label: "Ja" },
              { key: "nein", label: "Nein" },
            ],
          },
        },
        {
          name: "enableLocation",
          componentType: "form",
          component: "SurveyRadiobuttonGroup",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Möchten Sie einen Ort mit einem Pin auf der Karte markieren?",
            description:
              "Wenn Sie Nein auswählen, können Sie die Maßnahmenmeldung ohne Ortsangabe absenden.",
            options: [
              { key: "ja", label: "Ja" },
              { key: "nein", label: "Nein" },
            ],
          },
        },
        {
          name: "location",
          componentType: "form",
          component: "SurveySimpleMapWithLegend",
          validators: {
            onSubmit: ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
              if (
                fieldApi.form.getFieldValue("enableLocation") === "ja" &&
                fieldApi.state.value == null
              ) {
                return "Bitte markieren Sie einen Ort auf der Karte."
              }
              return undefined
            },
          },
          validation: fieldValidationEnum["conditionalRequiredLatLng"],
          defaultValue: null,
          props: {
            label: "Verortung auf der Karte",
            description:
              "Die Karte ist ein Platzhalter, bis die Trassendaten und die RSV-Konfiguration ergänzt werden. Wenn Sie einen Ort mit einem Pin markieren möchten, klicken Sie auf die Karte oder verschieben Sie den Pin.",
            mapProps: {
              config: {
                bounds: germanyBounds,
                minZoom: 5,
                maxZoom: 13,
              },
            },
            legendProps: {
              Markierung: {
                pin: {
                  label: "Verortung Ihrer Maßnahmenmeldung",
                  color: "bg-[#059669]",
                  className: "size-3 rounded-full",
                },
              },
            },
          },
        },
        {
          name: "feedbackText",
          componentType: "form",
          component: "SurveyTextarea",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: { label: "Beschreibung der Meldung" },
        },
        {
          name: "uploads",
          componentType: "form",
          component: "SurveyUploadField",
          validation: fieldValidationEnum["optionalArrayOfNumber"],
          defaultValue: [],
          props: {
            label: "Dokumente",
            description:
              "Optional für Skizzen, Fotos und Planungsunterlagen. Akzeptiert Bilder, PDF- und Office-Dokumente bis 50 MB; maximal 10 Dateien.",
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
            label: "E-Mail-Adresse zur Bestätigung der Maßnahmenmeldung",
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
              "Ich bestätige, dass ich zur Abgabe dieser Maßnahmenmeldung im Namen der angegebenen Stelle/Behörde berechtigt bin.",
          },
        },
      ],
    },
  ],
}
