import type { AnyFieldApi } from "@tanstack/react-form"
import { fieldValidationEnum } from "@/src/components/beteiligung/shared/fieldvalidationEnum"
import type { SurveyPart1and3 } from "@/src/components/beteiligung/shared/types"

const hasParkingNeed = (value: unknown) => value === "ja" || value === "vielleicht"

const parkingNeedCondition = {
  fieldName: "stellplatzBedarf",
  conditionFn: hasParkingNeed,
}

const validateCurrentParking = ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
  const value = fieldApi.state.value as string[]
  if (value.length > 3) return "Bitte maximal 3 Antworten auswählen."
  if (value.length > 1 && (value.includes("keinFahrrad") || value.includes("keineAngabe"))) {
    return "Bitte „In unserem Haushalt gibt es derzeit kein Fahrrad“ oder „Keine Angabe“ nur einzeln auswählen."
  }
  return undefined
}

const validateLocation = ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
  if (fieldApi.form.getFieldValue("enableLocation") === "ja" && !fieldApi.state.value) {
    return "Bitte setzen Sie einen Pin auf der Karte oder wählen Sie, dass Sie keinen Standort markieren möchten."
  }
  return undefined
}

export const part1Config: SurveyPart1and3 = {
  progressBarDefinition: 1,
  intro: {
    type: "standard",
    title: "Ihr Fahrrad sicher zu Hause abstellen",
    description: `## Mieter:innenbefragung im Projekt WohnBauRad

Wo fehlen sichere Fahrradstellplätze in Ihrer Wohnanlage? Welche Abstellmöglichkeiten wünschen Sie sich? Mit dieser kurzen Befragung möchten wir Ihre Bedürfnisse kennenlernen – insbesondere zu abschließbaren Fahrradboxen und gemeinschaftlichen Abstellräumen.

Die Befragung richtet sich an Mieter:innen der Münchner Wohnen in den ausgewählten Wohnanlagen. Auch wenn Sie derzeit kein Fahrrad besitzen, ist Ihre Meinung willkommen.

## Zweck und Ziel

Die Befragung findet im Rahmen des Forschungsprojektes [WohnBauRad](https://fixmycity.de/wohnbaurad/) statt, das die Förderung von Radverkehr in Wohnanlagen untersucht. Die Münchner Wohnen ist als Praxispartner an diesem Projekt beteiligt. Sie möchte durch die Förderung des Radverkehrs einen Beitrag zum Klimaschutz leisten und ihre Wohnanlagen besser mit dem Fahrrad erreichbar machen, um den veränderten Mobilitätsbedürfnissen ihrer Mieter:innen gerecht zu werden.

Ihre Antworten sollen helfen, Bedarfe und geeignete Abstellmöglichkeiten am Wohnort besser einzuschätzen. Dabei geht es auch um Fahrräder, die Sie besonders schützen möchten, etwa E-Bikes oder hochwertige Alltagsräder.

## Welche Angaben können Sie machen?

- Zu Ihrer heutigen Abstellsituation und Ihrem Bedarf an sicheren Stellplätzen
- Zu Ihren Vorstellungen zur Ausstattung und zum Standort neuer Radabstellanlagen
- Zu weiteren Anregungen zum Radfahren in Ihrem Wohnumfeld

## Hinweise zur Teilnahme

Die Teilnahme ist freiwillig und dauert voraussichtlich 5–10 Minuten. Bitte antworten Sie möglichst einmal für Ihren Haushalt. Optionale Fragen sind gekennzeichnet. Die Befragung ist keine Reservierung und keine Zusage für neue Stellplätze.

## Datenschutz

Alle personenbezogenen Daten werden gemäß DSGVO verarbeitet und nur für die Durchführung dieses digitalen Formulars gespeichert. Weitere Informationen finden Sie im Datenschutzhinweis.`,
    // Offen für Dev: projektspezifischen Datenschutzhinweis verlinken; nicht den
    // fremden Radschnellverbindungs-Link aus der Word-Vorlage übernehmen.
    buttons: [{ action: "next", label: "Befragung starten", position: "right" }],
  },
  buttonLabels: { next: "Weiter", back: "Zurück", submit: "Befragung absenden" },
  pages: [
    {
      id: "abstellsituation",
      fields: [
        {
          name: "titleAbstellsituation",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Ihre Abstellsituation und Ihr Bedarf" },
        },
        {
          name: "descriptionAbstellsituation",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown: "Bitte beziehen Sie Ihre Antworten auf Ihren Haushalt und Ihre Wohnanlage.",
          },
        },
        {
          name: "quartier",
          component: "SurveySelect",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "1. In welchem Quartier wohnen Sie?",
            placeholder: "Bitte Quartier auswählen",
            description:
              "Demo-Auswahl: Die Untersuchungsquartiere werden vor Veröffentlichung ergänzt.",
            // Offen für Dev: abgestimmte Quartiersliste mit stabilen Keys einsetzen.
            options: [
              {
                key: "beispielquartier",
                label: "Beispielquartier – vor Veröffentlichung ersetzen",
              },
            ],
          },
        },
        {
          name: "aktuelleAbstellorte",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          validators: {
            onChange: validateCurrentParking,
            onSubmit: validateCurrentParking,
          },
          props: {
            label:
              "2. Wo stellen Sie das Fahrrad bzw. die Fahrräder Ihres Haushalts zu Hause überwiegend ab?",
            description: "Bitte maximal 3 Antworten auswählen.",
            options: [
              { key: "fahrradraum", label: "In einem gemeinschaftlichen Fahrradraum oder Keller" },
              {
                key: "nichtUeberdachteBuegel",
                label: "An nicht überdachten Fahrradbügeln in der Nähe des Hauseingangs",
              },
              {
                key: "ueberdachteBuegel",
                label: "An überdachten Fahrradbügeln in der Nähe des Hauseingangs",
              },
              { key: "hauswand", label: "In sich abgeschlossen, an die Hauswand gelehnt" },
              { key: "wohnung", label: "In der Wohnung" },
              { key: "fahrradbox", label: "In einer Fahrradbox" },
              { key: "andererOrt", label: "An einem anderen Ort" },
              { key: "keinFahrrad", label: "In unserem Haushalt gibt es derzeit kein Fahrrad" },
              { key: "keineAngabe", label: "Keine Angabe" },
            ],
          },
        },
      ],
    },
    {
      id: "stellplatzbedarf",
      fields: [
        {
          name: "titleStellplatzbedarf",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Ihr Bedarf und Ihre Wünsche an sichere Stellplätze" },
        },
        {
          name: "stellplatzBedarf",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          listeners: {
            onChange: ({ fieldApi }) => {
              // Conditions hide fields but do not clear their values automatically.
              // Keep the four optional follow-ups on the same page as the controller
              // so there is no empty page for households without a parking need.
              if (!hasParkingNeed(fieldApi.state.value)) {
                fieldApi.form.setFieldValue("anzahlStellplaetze", "")
                fieldApi.form.setFieldValue("abstellmoeglichkeit", "")
                fieldApi.form.setFieldValue("wichtigeMerkmale", [])
                fieldApi.form.setFieldValue("zahlungsbereitschaft", "")
              }
            },
          },
          props: {
            label:
              "3. Benötigt Ihr Haushalt zusätzliche oder sichere abschließbare Fahrradstellplätze am Wohnort?",
            options: [
              { key: "ja", label: "Ja" },
              { key: "vielleicht", label: "Vielleicht / abhängig vom Angebot" },
              { key: "nein", label: "Nein" },
              { key: "keineAngabe", label: "Weiß ich nicht / keine Angabe" },
            ],
          },
        },
        {
          name: "anzahlStellplaetze",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          condition: parkingNeedCondition,
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label:
              "4. Für wie viele Fahrräder Ihres Haushalts würden Sie solche Stellplätze benötigen?",
            options: [
              { key: "eins", label: "1" },
              { key: "zwei", label: "2" },
              { key: "drei", label: "3" },
              { key: "vierOderMehr", label: "4 oder mehr" },
              { key: "weissNicht", label: "Weiß ich noch nicht" },
            ],
          },
        },
        {
          name: "abstellmoeglichkeit",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          condition: parkingNeedCondition,
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "5. Welche Abstellmöglichkeit käme für Ihren Haushalt am ehesten infrage?",
            options: [
              { key: "fahrradbox", label: "Eine einzeln abschließbare Fahrradbox" },
              {
                key: "gemeinschaftsraum",
                label: "Ein gemeinschaftlicher abschließbarer Fahrradraum oder eine Sammelgarage",
              },
              { key: "beide", label: "Beide Lösungen gleichermaßen" },
              { key: "weissNicht", label: "Weiß ich noch nicht" },
            ],
          },
        },
        {
          name: "wichtigeMerkmale",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          condition: parkingNeedCondition,
          validation: fieldValidationEnum["optionalArrayOfStringMax3"],
          defaultValue: [],
          props: {
            label: "6. Was wäre Ihnen bei einem solchen Stellplatz besonders wichtig?",
            description: "Bitte maximal 3 Antworten auswählen.",
            options: [
              { key: "diebstahlschutz", label: "Schutz vor Diebstahl und Beschädigung" },
              { key: "wetterschutz", label: "Schutz vor Regen und Witterung" },
              {
                key: "barrierefreierZugang",
                label: "Barrierefreier Zugang ohne Treppen oder schweres Heben",
              },
              { key: "kurzerWeg", label: "Kurzer Weg zum Hauseingang" },
              {
                key: "platzFuerGrosseRaeder",
                label: "Genügend Platz, auch für größere Fahrräder oder Lastenräder",
              },
              { key: "beleuchtung", label: "Gute Beleuchtung" },
              { key: "geringeKosten", label: "Geringe Nutzungskosten" },
            ],
          },
        },
        {
          name: "zahlungsbereitschaft",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          condition: parkingNeedCondition,
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label:
              "7. Wie viel wären Sie bereit, für einen sicheren Stellplatz im Monat pro Haushalt zu zahlen?",
            options: [
              { key: "einsBisFuenf", label: "Zwischen 1 und 5 Euro" },
              { key: "fuenfBisZehn", label: "Zwischen 5 und 10 Euro" },
              { key: "zehnBisFuenfzehn", label: "Zwischen 10 und 15 Euro" },
              { key: "garNichts", label: "Gar nichts" },
            ],
          },
        },
      ],
    },
    {
      id: "standortUndAnregungen",
      fields: [
        {
          name: "titleStandort",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Standort und weitere Anregungen" },
        },
        {
          name: "enableLocation",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "nein",
          listeners: {
            onChange: ({ fieldApi }) => {
              // This map belongs to part1, so clear the pin locally rather than
              // relying on SurveyMainPage's part2-only location cleanup.
              if (fieldApi.state.value !== "ja") {
                fieldApi.form.setFieldValue("location", null)
              }
            },
          },
          props: {
            label: "8. Wo in Ihrer Wohnanlage wünschen Sie sich bessere Fahrradstellplätze?",
            description:
              "Möchten Sie einen Standort auf der Karte markieren? Sie können auch nur das Freitextfeld darunter nutzen.",
            options: [
              { key: "ja", label: "Ja, ich möchte einen Standort auf der Karte markieren" },
              { key: "nein", label: "Nein, ich möchte keinen Standort auf der Karte markieren" },
            ],
          },
        },
        {
          name: "location",
          component: "SurveySimpleMapWithLegend",
          componentType: "form",
          condition: {
            fieldName: "enableLocation",
            conditionFn: (value) => value === "ja",
          },
          validation: fieldValidationEnum["conditionalRequiredLatLng"],
          // No preset pin: the demo map must never create an unchosen location.
          defaultValue: null,
          validators: { onChange: validateLocation, onSubmit: validateLocation },
          props: {
            label: "Bitte markieren Sie den gewünschten Standort auf der Karte.",
            description:
              "Platzhalterkarte für München: Die Untersuchungsquartiere und Wohnanlagen werden vor Veröffentlichung ergänzt. Klicken Sie auf die Karte, um einen Pin zu setzen. Sie können den Pin anschließend verschieben.",
            mapProps: {
              config: {
                // Karte = Dummy, Dev muss nacharbeiten. Bounds are for Munich only;
                // exact project area and mapData must be supplied in the Dev phase.
                bounds: [11.36, 48.06, 11.74, 48.25],
                minZoom: 9,
                maxZoom: 18,
              },
            },
            legendProps: {},
          },
        },
        {
          name: "standortBeschreibung",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Beschreibung des gewünschten Standorts",
            description:
              "Beschreiben Sie einen Bereich, zum Beispiel „am Zugang zum Innenhof“ oder „neben den vorhandenen Fahrradständern“.",
          },
        },
        {
          name: "weitereAnregungen",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "9. Was würde Ihnen das Radfahren im Wohnumfeld ansonsten noch erleichtern?",
            description:
              "Hier ist Platz für Probleme mit dem heutigen Abstellen von Fahrrädern und weitere Wünsche – zum Beispiel eine Luftpumpe, Reparaturmöglichkeiten oder besser erreichbare Wege.",
          },
        },
      ],
    },
  ],
}
