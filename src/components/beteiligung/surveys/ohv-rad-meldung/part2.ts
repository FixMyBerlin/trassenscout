import { AnyFieldApi } from "@tanstack/react-form"
import { fieldValidationEnum } from "@/src/components/beteiligung/shared/fieldvalidationEnum"
import { SurveyPart2 } from "@/src/components/beteiligung/shared/types"
import { mapData } from "@/src/components/beteiligung/surveys/ohv-rad-meldung/mapData.const"

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 1,
  intro: {
    type: "standard",
    title: "Maßnahmenmeldung im Rahmen der kommunalen Beteiligung zum Radnetzkonzept",
    description: `Willkommen beim digitalen Beteiligungsportal zur Radnetzplanung des Landkreises Oberhavel. Über dieses Formular können Kommunen Maßnahmen auf Grundlage des vorliegenden Radnetzkonzepts zügig, systematisch und transparent an den Landkreis melden.

Die strukturierte Erfassung bildet die direkte Basis für die anschließende Prüfung, fachliche Bewertung und rechtliche Abwägung der Maßnahmen durch den Landkreis.

## Zweck und Zielstellung

Das ausgearbeitete Radnetz bildet die Grundlage für die künftige Entwicklung der Radinfrastruktur in der Region. Um die kommunalen Belange optimal einzubinden, dient diese Maßnahmenmeldung als zentrales Eingabetool.

Ziel ist es, die Qualität der Rückmeldungen zu sichern, den Auswertungsaufwand zu strukturieren und die Weiterverarbeitung für die nächsten Planungsschritte – wie die finale Netzabstimmung und die zeitnahe Priorisierung von Umsetzungsmaßnahmen – so effizient wie möglich zu gestalten.

## Welche Maßnahmen können gemeldet werden?

Auf Basis des hinterlegten Radnetzes können Sie spezifische, vor allem punktuelle und ergänzende Maßnahmenvorschläge einreichen. Dazu gehören unter anderem:

- Besondere Querungsstellen & Überwege (z. B. Mittelinseln, Signalanlagen, Sichtbeziehungen)
- Fahrradabstellanlagen & Verknüpfungspunkte (z. B. B&R-Anlagen, Bike-Boxen, Ladestationen)
- Punktuelle Schwachstellen & Ausbaubedarfe (z. B. Belagsschäden, Engstellen, Gefahrenpunkte)
- Allgemeine Anmerkungen zum Trassenverlauf oder zu Verknüpfungen im Netz

## Hinweise zur Übermittlung

Bitte füllen Sie das Formular vollständig aus. Nach dem Absenden wird Ihre Meldung direkt im System erfasst und dem zuständigen Planungsteam zur Auswertung bereitgestellt.

[Datenschutzhinweis](https://trassenscout.de/datenschutz): Alle angegebenen personenbezogenen Daten werden ausschließlich für die Durchführung und Nachbereitung dieses Beteiligungsverfahrens gemäß DSGVO verarbeitet.

Sind Sie eine **Kommune** im **Landkreis Oberhavel**?

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
          props: {
            title: "Maßnahmenmeldung im Rahmen der kommunalen Beteiligung zum Radnetzkonzept",
          },
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
          name: "municipality",
          componentType: "form",
          component: "SurveyTextfield",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: { label: "Name der meldenden Kommune" },
        },
        {
          name: "category",
          componentType: "form",
          component: "SurveyCheckboxGroup",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Kategorie der Maßnahme",
            description: "Bitte wählen Sie mindestens eine Kategorie aus.",
            options: [
              {
                key: "querung_knotenpunkt",
                label:
                  "Querung & Knotenpunkt (z. B. Ampeln, Mittelinseln, Abbiegesituationen, Vorfahrtsregelungen)",
              },
              {
                key: "radverkehrsfuehrung_flaechenaufteilung",
                label:
                  "Radverkehrsführung & Flächenaufteilung (z. B. Schutz- oder Radfahrstreifen, baulich getrennte Radwege, Piktogrammketten, Aufhebung von Mischverkehr, Umgestaltung von Kfz-Fahrstreifen oder Parkständen)",
              },
              {
                key: "netzluecke_trassenfuehrung",
                label:
                  "Netzlücke & Trassenführung (z. B. fehlende Verbindung, Netzerweiterung, Einbahnstraßenöffnung)",
              },
              {
                key: "streckenzustand_qualitaet",
                label:
                  "Streckenzustand & Qualität (z. B. Belagsschäden, Engstellen, Beleuchtung, Führung bei Baustellen)",
              },
              {
                key: "verkehrssicherheit_sicht",
                label:
                  "Verkehrssicherheit & Sicht (z. B. Gefahrenstelle, Grünschnitt/Sichthindernisse, Falschparker-Schwerpunkte)",
              },
              {
                key: "fahrradparken_service",
                label:
                  "Fahrradparken & Service (z. B. B&R-Anlagen, Fahrradbügel, Bike-Boxen, Ladestationen)",
              },
              {
                key: "schnittstelle_oepnv_intermodalitaet",
                label:
                  "Schnittstelle ÖPNV / Intermodalität (z. B. Anbindung an Haltestellen, ZOB oder Bahnhof)",
              },
              {
                key: "verkehrsberuhigung_geschwindigkeitsmanagement",
                label:
                  "Verkehrsberuhigung & Geschwindigkeitsmanagement (z. B. Tempo 30, Modalfilter, Diagonalsperren, Durchfahrtsbeschränkungen, Schwellen, Reduzierung von Schleichverkehr)",
              },
              {
                key: "beschilderung_wegweisung",
                label:
                  "Beschilderung und Wegweisung (z. B. Fahrradwegweisung, Routenbeschilderung, Fahrbahnmarkierungen, Markierung von Konfliktbereichen, Hinweise an Baustellen)",
              },
              { key: "sonstiges", label: "Sonstiges / Allgemeiner Hinweis" },
            ],
          },
        },
        {
          name: "location",
          componentType: "form",
          component: "SwitchableMap",
          // `location` only holds the pin. An existing Planungsabschnitt is stored in `geometryCategory`.
          // We therefore allow null at the zod level (conditionalRequiredLatLng) and enforce the
          // requiredness in the custom validator below, which reads the `locationMode` set by the map component.
          validation: fieldValidationEnum["conditionalRequiredLatLng"],
          defaultValue: null,
          validators: {
            onSubmit: ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
              const mode = fieldApi.form.getFieldValue("locationMode") ?? "existing"
              if (mode === "none") return undefined
              if (mode === "existing") {
                return fieldApi.form.getFieldValue("geometryCategory")
                  ? undefined
                  : "Bitte wählen Sie einen Planungsabschnitt auf der Karte aus."
              }
              return fieldApi.state.value == null
                ? "Bitte markieren Sie einen Ort auf der Karte."
                : undefined
            },
          },
          props: {
            label: "Verortung auf der Karte",
            description:
              "Klicken Sie auf einen Planungsabschnitt, um ihn auszuwählen, oder setzen Sie einen Pin. Die Karte kann bei Bedarf verschoben oder über die Schaltflächen „+/-“ verkleinert oder vergrößert werden.",
            modeSelector: {
              question: "Raumbezug & fachliche Zuordnung",
              description:
                "Wählen Sie aus, worauf sich Ihre Maßnahmenmeldung bezieht. Für einen Planungsabschnitt oder eine Punktsetzung können Sie anschließend einen Ort auf der Karte markieren.",
              existingLabel: "Planungsabschnitt/ Maßnahme auf der Karte",
              pinLabel: "Pinsetzung auf der Karte",
              noneLabel: "Kein Ortsbezug, allgemeiner Hinweis",
            },
            mapProps: {
              mapData,
              allowNoMapOption: true,
              additionalData: [],
              geometryDataKey: "geometryCategory",
              geoCategoryIdDefinition: {
                dataKey: "geometryCategoryId",
                propertyName: "subsectionSlug",
              },
              infoPanelText:
                "Wählen Sie einen Planungsabschnitt aus, zu dem Sie eine Maßnahme melden möchten.",
              config: {
                bounds: [12.824965, 52.586742, 13.520948, 53.251088],
                minZoom: 7,
                maxZoom: 16,
              },
            },
            legendProps: {
              Legende: {
                pa: {
                  label: "Auswählbare Planungsabschnitte",
                  color: "bg-[#02558e]",
                  className: "h-[5px]",
                },
                pin: {
                  label: "Ihr Pin",
                  color: "bg-[#02558e]",
                  className: "size-2! rounded-full",
                },
              },
            },
          },
        },
        {
          name: "geometryCategory",
          componentType: "form",
          component: "hidden",
          props: { label: "Geometrie des ausgewählten Planungsabschnitts" },
        },
        {
          name: "geometryCategoryId",
          componentType: "form",
          component: "hidden",
          props: { label: "Kürzel des ausgewählten Planungsabschnitts" },
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
          name: "priority",
          componentType: "form",
          component: "SurveyRadiobuttonGroup",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Priorisierung der Maßnahme",
            description: "Wie hoch wird die Priorität eingeschätzt?",
            options: [
              { key: "hoch", label: "Hoch" },
              { key: "mittel", label: "Mittel" },
              { key: "niedrig", label: "Niedrig" },
              { key: "keine_einschaetzung", label: "Keine Einschätzung" },
            ],
          },
        },
        {
          name: "priorityReason",
          componentType: "form",
          component: "SurveyTextarea",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: { label: "Begründung der Priorität" },
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
          props: { label: "Name einer zuständigen Kontaktperson" },
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
      ],
    },
  ],
}
