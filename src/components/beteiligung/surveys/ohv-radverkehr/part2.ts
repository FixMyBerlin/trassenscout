import { AnyFieldApi } from "@tanstack/react-form"
import { fieldValidationEnum } from "@/src/components/beteiligung/shared/fieldvalidationEnum"
import { SurveyPart2 } from "@/src/components/beteiligung/shared/types"
import { mapData } from "@/src/components/beteiligung/surveys/ohv-radverkehr/mapData.const"

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 1,
  intro: {
    type: "standard",
    title: "Anhörung & Stellungnahme im Rahmen der TÖB-Beteiligung zum Radnetzkonzept",
    description: `Willkommen beim digitalen Beteiligungsportal zur Radnetzplanung des Landkreises Oberhavel. Über dieses Formular können Städte, Gemeinden sowie weitere Träger öffentlicher Belange (TÖB) ihre formelle Stellungnahme, fachlichen Hinweise und Abwägungsbelange auf Grundlage des vorliegenden Radnetzkonzepts zügig, systematisch und transparent an den Landkreis übermitteln.

Die strukturierte Erfassung bildet die direkte Grundlage für die anschließende Prüfung, fachliche Bewertung und rechtliche Abwägung der Stellungnahmen durch die Verwaltung.

## Zweck und Zielstellung

Das ausgearbeitete Radnetz bildet die Grundlage für die künftige Entwicklung der Radinfrastruktur in der Region. Um die Belange der Träger öffentlicher Belange, kommunale Erfordernisse und fachspezifische Rahmenbedingungen optimal einzubinden, dient dieses Anhörungsportal als zentrales Eingabetool.

Ziel ist es, die Qualität der Rückmeldungen zu sichern, den Auswertungsaufwand zu strukturieren und die Weiterverarbeitung für die nächsten Planungsschritte – wie die finale Netzabstimmung und die zeitnahe Priorisierung von Umsetzungsmaßnahmen – so effizient wie möglich zu gestalten.

## Gegenstand der Anhörung: Was können Sie zurückmelden?

Auf Basis des hinterlegten Radnetzkonzepts können Sie Ihr formelles Votum sowie spezifische fachliche Hinweise einreichen. Dazu gehören unter anderem:

- Grundsätzliches Votum / Haltung (z. B. Zustimmung, Einwände, Hinweise oder Rückmeldung „Keine Belange betroffen“)
- Fachspezifische Belange & Schutzgüter (z. B. Naturschutz, Denkmalschutz, Verkehrssicherheit, Rettungswege, Leitungsträger, ÖPNV)
- Korrektur- und Anpassungsbedarf zu konkreten Trassenverläufen, Knotenpunkten oder Querungsstellen
- Hinweise zum Grunderwerb oder zu gemeindeeigenen / behördlichen Liegenschaften
- Ergänzende Dokumente & Pläne zur Begründung Ihrer Stellungnahme

## Hinweise zur Übermittlung

Bitte füllen Sie das Formular vollständig aus. Nach dem Absenden wird Ihre Meldung direkt im System erfasst und dem zuständigen Planungsteam zur Auswertung bereitgestellt.

[Datenschutzhinweis](https://trassenscout.de/datenschutz): Alle angegebenen personenbezogenen Daten werden ausschließlich für die Durchführung und Nachbereitung dieses Beteiligungsverfahrens gemäß DSGVO verarbeitet.

Mit dem Aufrufen des Formulars stimme ich der Datenschutzerklärung zu. Die Daten werden gemäß DSGVO verarbeitet und nur für die Durchführung dieses digitalen Meldeverfahrens gespeichert.`,
    buttons: [
      { action: "next", label: "Zur Stellungnahme", position: "right", color: "primaryColor" },
    ],
  },
  buttonLabels: {
    next: "Weiter",
    back: "Zurück",
    submit: "Stellungnahme absenden",
  },
  pages: [
    {
      id: "stellungnahme",
      fields: [
        {
          name: "title",
          componentType: "content",
          component: "SurveyPageTitle",
          props: { title: "Ihre Stellungnahme zum Radnetzkonzept" },
        },
        {
          name: "description",
          componentType: "content",
          component: "SurveyMarkdown",
          props: {
            markdown:
              "Bitte nutzen Sie das Formular für jeweils nur eine Stellungnahme. Sie können weitere Stellungnahmen in einem weiteren Schritt hinzufügen und absenden.",
          },
        },
        {
          name: "institution",
          componentType: "form",
          component: "SurveyTextfield",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: { label: "Institution / Organisation" },
        },
        {
          name: "department",
          componentType: "form",
          component: "SurveyTextfield",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: { label: "Fachbereich / Abteilung" },
        },
        {
          name: "category",
          componentType: "form",
          component: "SurveyRadiobuttonGroup",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Formelle Haltung",
            description: "Bitte wählen Sie eine Kategorie aus.",
            options: [
              { key: "keine_belange", label: "Keine Belange / Nicht betroffen" },
              { key: "zustimmung_ohne_einwaende", label: "Zustimmung ohne Einwände" },
              {
                key: "zustimmung_mit_hinweisen",
                label: "Zustimmung mit Hinweisen / Anregungen",
              },
              { key: "bedenken_einwaende", label: "Bedenken / Einwände (Korrekturbedarf)" },
              { key: "grundlegende_ablehnung", label: "Grundlegende Ablehnung" },
            ],
          },
        },
        {
          name: "location",
          componentType: "form",
          component: "SwitchableMap",
          // `location` only holds the pin. An existing Planungsabschnitt is stored in `geometryCategory`.
          // We therefore allow null at the zod level (conditionalRequiredLatLng) and enforce the
          // requiredness in the custom validator below, which reads the `locationMode` set by the map component
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
                "Wählen Sie aus, worauf sich Ihre Stellungnahme bezieht. Für einen Planungsabschnitt oder eine Punktsetzung können Sie anschließend einen Ort auf der Karte markieren.",
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
              infoPanelText: "Wählen Sie einen Planungsabschnitt aus, zu dem Sie Stellung nehmen.",
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
          name: "topics",
          componentType: "form",
          component: "SurveyCheckboxGroup",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Themenbereich",
            description: "Bitte wählen Sie mindestens einen Themenbereich aus.",
            options: [
              { key: "denkmalschutz_ortsbild", label: "Denkmalschutz & Ortsbild" },
              { key: "naturschutz_landschaftspflege", label: "Naturschutz & Landschaftspflege" },
              { key: "verkehrssicherheit_ordnung", label: "Verkehrssicherheit & Ordnung" },
              {
                key: "einsatzkraefte_rettungswege",
                label: "Einsatzkräfte & Rettungswege (Feuerwehr / Polizei)",
              },
              {
                key: "leitungstraeger_versorgung",
                label: "Leitungsträger, Ver- & Entsorgung (Strom, Wasser, Glasfaser)",
              },
              {
                key: "grunderwerb_liegenschaften_nachbarrechte",
                label: "Grunderwerb, Liegenschaften & Nachbarrechte",
              },
              { key: "oepnv_schieneninfrastruktur", label: "ÖPNV & Schieneninfrastruktur" },
              { key: "allgemeines_sonstiges", label: "Allgemeines / Sonstiges" },
            ],
          },
        },
        {
          name: "feedbackText",
          componentType: "form",
          component: "SurveyTextarea",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Stellungnahme",
            description:
              "Konkrete Ausführung, Bedenken, Änderungsvorschläge oder Forderungen zur Priorisierung.",
          },
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
              "Optional für formelle Anschreiben, Lagepläne, Gutachten oder Stellungnahmedokumente. Akzeptiert Bilder, PDF- und Office-Dokumente bis 50 MB; maximal 10 Dateien.",
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
            label: "E-Mail-Adresse zur Bestätigung der Stellungnahme",
            type: "email",
            autoComplete: "email",
          },
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
              "Ich bestätige, dass ich zur Abgabe dieser Stellungnahme im Namen der angegebenen Stelle / Behörde berechtigt bin.",
          },
        },
      ],
    },
  ],
}
