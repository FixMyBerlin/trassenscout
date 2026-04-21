import communes_bboxes from "@/src/app/beteiligung/_ohv-haltestellenfoerderung/communes_bboxes.json"
import { mapData } from "@/src/app/beteiligung/_ohv-haltestellenfoerderung/mapData.const"
import { fieldValidationEnum } from "@/src/app/beteiligung/_shared/fieldvalidationEnum"
import {
  geoCategorySetInitialBoundsDefinition,
  SurveyPart2,
} from "@/src/app/beteiligung/_shared/types"
import { isDev } from "@/src/core/utils/isEnv"
import { AnyFieldApi } from "@tanstack/react-form"
import { getYear, isBefore } from "date-fns"

const validateRealisationYear = ({ fieldApi }: { fieldApi: AnyFieldApi }) => {
  // we can be sure that it is numeric as we use the requiredYearString validation
  const year = Number(fieldApi.state.value)

  const now = new Date()
  const currentYear = getYear(now)
  const feb1 = new Date(currentYear, 1, 1)
  const minYear = isBefore(now, feb1) ? currentYear + 1 : currentYear + 2
  const maxYear = 2031

  if (year < minYear) {
    return `Das Realisierungsjahr muss mindestens ${minYear} sein.`
  }
  if (year > maxYear) {
    return `Das Realisierungsjahr darf maximal ${maxYear} sein.`
  }

  return undefined
}

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 2,
  intro: {
    type: "standard",
    title:
      "Maßnahmenmeldung für die Vergabe von Zuschüssen für Bau- und Ausbaumaßnahmen- an Verknüpfungs- und Zugangsanlagen im Bereich des übrigen ÖPNV im Landkreis Oberhavel",
    description: `Der Landkreis Oberhavel gewährt nach Maßgabe des Gesetzes über den öffentlichen Personennahverkehr des Landes Brandenburg (ÖPNVG) und in entsprechender Anwendung der Verwaltungsvorschriften (VV) zu §§ 23 und 44 der Landeshaushaltsordnung (LHO) Zuwendungen für Investitionen zur Verbesserung der kommunalen Infrastruktur im Bereich des übrigen ÖPNV (Vorhaben).

Im Fokus der Investitionsförderung stehen kommunale Maßnahmen, die zur Attraktivitätssteigerung und besseren Nutzbarkeit des übrigen ÖPNV beitragen sollen. Die gezielte Förderung von Mobilitätsmaßnahmen stärkt den übrigen ÖPNV in den Regionen, kann bedarfsgerechte Mobilitätsangebote aufrechterhalten oder ausbauen und damit die Erreichbarkeit besonders im ländlichen Raum sichern.

## Förderrichtlinie

Grundlage für das Aufsetzen des 5-Jahres-Förderprogramms ist der Kreistagsbeschluss Nr. 3/0110 des Kreistags Landkreis Oberhavel vom 23. Februar 2005, mit dem die Förderrichtlinie über die Vergabe von Zuschüssen für Bau- und Ausbaumaßnahmen an Verknüpfungs- und Zugangsanlagen im Bereich des übrigen ÖPNV beschlossen wurde.

Für die Umsetzung des Beschlusses stellt der Landkreis auf dieser Plattform ein systematisiertes und digitales Verfahren für die Antragstellenden zur Verfügung. Die Plattform wird für das landkreisweite Förderverfahren eingesetzt mit den Zielen, die Qualität der kommunalen Eingaben zu erhöhen, die Prüfung und Weiterverarbeitung von Informationen zu vereinfachen und Grundlagen für die spätere Förderantragstellung zu schaffen. Sie bildet neben dem 2-stufigen Prozess von der Vorhabenmeldung zur Antragstellung auch nachgelagerte Anforderungen an den Nachweis der Mittelverwendung ab.

Bitte beachten Sie: Die Maßnahmenmeldung über dieses Formular stellt noch keinen Förderantrag dar. Sie dient als strukturierte Vorprüfung im Rahmen des Landkreiskonzepts und bildet die Grundlage für die Auswahl und Priorisierung der Projekte im Rahmen des jährlichen Fortschreibungsprozesses.

## Fördergegenstand

Voraussetzung für eine Förderung ist die nachvollziehbare Begründung des Bedarfs, eine Einordnung in kommunale oder regionale Planungen sowie die Einhaltung technischer und qualitativer Standards.

Alle Städte, Gemeinden und Ämter des Landkreises Oberhavel sowie öffentlich oder privatrechtlich organisierte Verkehrsunternehmen des ÖPNV, soweit sie gemeinwirtschaftliche Leistungen oder förderfähige Verkehrsleistungen im Landkreises Oberhavel erbringen, können Maßnahmenvorschläge zu Bau-, Ausbau- und Modernisierungsvorhaben folgender Maßnahmenbereiche einreichen:
- Zentrale Omnibusbahnhöfe (ZOB);
- Haltestelleneinrichtungen;
- Buswendeschleifen / Bahnhofsvorplätze als Verknüpfungs- und Umsteigeanlagen unterschiedlicher Verkehrsträger (sofern sie nicht bereits im Zusammenhang mit Straßenbaumaßnahmen gefördert werden);
- Umsteigeparkplätze ausgenommen Parkhäuser (P&R-, B&R-Anlagen);
- Beschleunigungsmaßnahmen für den ÖPNV,
- Weiterentwicklung von ÖPNV-Haltestellen zu intermodalen Mobilitätsknotenpunkten
- Taxistellplätze

## Fristen

- 31.01. Ende Anmeldung für Vorhaben mit Umsetzung im folgenden Kalenderjahr
- 30.04. Bestätigung der Finanzierung für das Folgejahr durch den Landkreis
- 31.05. Versand des bestätigten Programms sowie der strukturellen Bedarfserfassung durch den Landkreis
- 30.09. Ende Antragstellung für Vorhaben mit Umsetzung im folgenden Kalenderjahr

Die Plattform ist für das Anmelde- und Antragsverfahren grundsätzlich immer geöffnet. Sie können daher jederzeit Vorhaben melden bzw. Anträge stellen und Unterlagen hochladen. Für die Erstellung des 5-Jahresprogramms sind jedoch die oben genannten Fristen zwingend zu beachten. Eintragungen, die nach den genannten Stichtagen getätigt werden, können für das jeweils nächste 5-Jahresprogramm nicht berücksichtigt werden.

Nach dem Stichtag des Anmeldeverfahrens werden die eingegangenen Meldungen durch die OHBV gesichtet und in Rücksprache mit dem Landkreis geprüft. Die Entscheidungen über die Aufnahme in das 5-Jahresprogramm sowie eine etwaige Konsultation anderer Fachbereiche der Verwaltung liegen beim Landkreis.

Nach Erstellung des 5-Jahresprogramms wird dieses digital an alle Angemeldeten übermittelt. Die Benachrichtigung enthält als Anlage die Zusammenstellung der aufgenommenen Maßnahmen mit einem 5-Jahres-Horizont - für das jeweils folgende Kalenderjahr in Form eines bestätigen Finanzierungsplans, für die darauffolgenden vier Kalenderjahre als nicht bestätigte strukturelle Bedarfserfassung. Die im Finanzierungsplan enthaltenen angemeldeten Vorhaben erhalten auf dieser Grundlage in einem gesonderten Schritt die Aufforderung zur Antragstellung.

## Kontakt

Sollte es noch offene Punkte oder Herausforderungen beim digitalen Verfahren geben, können Sie den Landkreis Oberhavel kontaktieren. Antworten auf häufig gestellte Fragen finden Sie auf dieser Seite.

**Ansprechperson** \\
Alexander Greifenberg (Teamleiter Verkehrsplanung)\\
Oberhavel Holding Besitz- und Verwaltungsgesellschaft GmbH\\
Annahofer Str. 1A\\
16515 Oranienburg\\
Ortsteil Germendorf\\
Tel.: +493301699376\\
Fax: +493301699333\\
E-Mail: [a.greifenberg@ohbv.de](mailto:a.greifenberg@ohbv.de)

**Weitere Informationen**\\
Die Maßnahmenmeldung wird nicht zwischengespeichert, d.h. bei Verlassen der Seite gehen alle eingetragenen Informationen verloren. Nach dem Absenden der Maßnahmenmeldung können Sie nicht mehr auf Ihre getätigten Eingaben zugreifen. Deshalb ist es sinnvoll, die Maßnahmenmeldung erst dann auszufüllen und abzusenden, sobald Sie alle wichtigen Informationen für die Maßnahmenmeldung vorliegen haben. Folgende Informationen werden im Rahmen der Maßnahmenmeldung abgefragt:
- Auswahl des Fördergegenstands
- Bezug zu vorhandener Haltestelle durch Auswahl auf Karte
- Maßnahmenbeschreibung und Zielsetzung
- Abfrage ob Gemeinschaftsbauwerk
- Stand der Bauvorbereitung (optional)
- Vereinfachte Kostenberechnung (€)
- Upload für Dokumente (optional) gemäß 7.3 der Förderrichtlinie, mindestens
- Planungsunterlagen gemäß HOAI, Leistungsphase 2;
- Finanzierungsmodell;
- Beschreibung der Dokumente (optional)
- Angaben zur Ko-Finanzierung (wenn ja, Mittelgeber und Programm)
- Voraussichtliches Realisierungsjahr
- Name, Telefonnummer und E-Mail-Adresse der zuständigen Kontaktperson

Mit dem Aufrufen des Formulars stimme ich der [Datenschutzerklärung](https://trassenscout.de/datenschutz) zu. Die Daten werden gemäß DSGVO verarbeitet und nur für die Durchführung dieses digitalen Förderverfahrens gespeichert.`,
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
      id: "feedback",
      fields: [
        {
          name: "title",
          componentType: "content",
          component: "SurveyPageTitle",
          props: {
            title:
              "Ihr Maßnahmenvorschlag für Bushaltestellen und Businfrastruktur im Landkreis Oberhavel",
          },
        },
        {
          name: "description",
          componentType: "content",
          component: "SurveyMarkdown",
          props: {
            markdown: `Bitte nutzen Sie das Formular für jeweils nur eine Maßnahmenmeldung. Sie können weitere Maßnahmenmeldungen in einem weiteren Schritt hinzufügen und absenden.`,
          },
        },
        // Gegenstand der Förderung/SubsubsectionInfrastructureType
        {
          name: "category",
          componentType: "form",
          component: "SurveyCheckboxGroup",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Bitte wählen Sie den Gegenstand der Förderung aus.",
            options: [
              { key: "zob", label: "Zentrale Omnibusbahnhöfe (ZOB)" },
              { key: "haltestelleneinrichtungen", label: "Haltestelleneinrichtungen" },
              {
                key: "buswendeschleifen",
                label:
                  "Buswendeschleifen / Bahnhofsvorplätze als Verknüpfungs- und Umsteigeanlagen unterschiedlicher Verkehrsträger (sofern sie nicht bereits im Zusammenhang mit Straßenbaumaßnahmen gefördert werden)",
              },
              {
                key: "pandr",
                label: "Umsteigeparkplätze ausgenommen Parkhäuser (P&R-, B&R-Anlagen)",
              },
              { key: "beschleunigung", label: "Beschleunigungsmaßnahmen für den ÖPNV" },
              {
                key: "intermodale_mobilitaetsknoten",
                label:
                  "Weiterentwicklung von ÖPNV-Haltestellen zu intermodalen Mobilitätsknotenpunkten",
              },
              { key: "taxistellplaetze", label: "Taxistellplätze" },
            ],
          },
        },
        {
          name: "commune",
          component: "SurveySelect",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "unknown",
          props: {
            label: "Name der meldenden Kommune",
            readOnly: true,
            description: "Dieses Feld wird automatisch ausgefüllt.",
            // placeholder: "Kommune auswählen",
            queryId: "id",
            options: [
              ...communes_bboxes.map((c) => ({ key: c.id, label: c.name })),
              { key: "unknown", label: "unbekannt" },
            ],
          },
        },
        {
          name: "location",
          componentType: "form",
          component: "SwitchableMapWithLegend",
          validation: fieldValidationEnum["requiredLatLng"],
          defaultValue: null,
          props: {
            label: "Maßnahmenverortung",
            description:
              "Wählen Sie eine Bushaltestelle aus, zu welcher Sie eine Maßnahme melden möchten. Die Bushaltestellen sind auf der Karte mit orangen Punkten markiert. Klicken Sie auf einen Punkt, um die Haltestelle auszuwählen. Die Karte kann bei Bedarf verschoben oder über die Schaltflächen „+/-“ verkleinert oder vergrößert werden.",
            mapProps: {
              mapData: mapData,
              setInitialBounds: {
                initialBoundsDefinition:
                  communes_bboxes as unknown as geoCategorySetInitialBoundsDefinition,
                queryParameter: "id",
              },
              additionalData: [
                { dataKey: "hsName", propertyName: "stop_name", label: "Name der Haltestelle" },
                { dataKey: "routeIds", propertyName: "route_ids", label: "IDs der Routen" },
              ],
              geoCategoryIdDefinition: { dataKey: "geometryCategoryId", propertyName: "stop_id" },
              infoPanelText:
                "Wählen Sie eine Bushaltestelle aus, zu welcher Sie eine Maßnahme melden möchten.",
              config: {
                bounds: [12.824965, 52.586742, 13.520948, 53.251088], // Bounding box for Oberhavel to be validated
              },
            },
            legendProps: {
              Legende: {
                hs: {
                  label: "Auswählbare Bushaltestellen",
                  color: "bg-[#f5824d]",
                  className: "h-2! w-2! rounded-full shrink-0",
                },
                bordersLandkreis: {
                  label: "Landkreisgrenzen",
                  color: "bg-[#333333] opacity-70",
                  className: "h-[3px]",
                },
                bus: {
                  label: "Buslinien",
                  color: "bg-[#e9ca3099]",
                  className: "h-[2px]",
                },
                bordersGemeinde: {
                  label: "Gemeindegrenzen",
                  color: "bg-[#333333] opacity-70",
                  className: "h-[1.5px]",
                },
              },
            },
          },
        },
        {
          name: "geometryCategoryId",
          componentType: "form",
          component: "hidden",
          props: { label: "ID der ausgewählten Haltestelle" },
        },
        {
          name: "hsName",
          componentType: "form",
          component: "hidden",
          props: { label: "Name der ausgewählten Haltestelle" },
        },
        {
          name: "hsName",
          componentType: "form",
          component: "hidden",
          props: { label: "IDs der Routen" },
        },
        {
          name: "feedbackText",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Maßnahmenbeschreibung und Zielsetzung",
          },
        },
        {
          name: "stateOfConstruction",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Stand der Bauvorbereitung",
          },
        },
        {
          name: "costs",
          component: "SurveyNumberfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredNumber"],
          defaultValue: null,
          props: {
            label: "Kostenberechnung",
            description:
              "Bitte tragen Sie hier ausschließlich die förderfähigen Baukosten ein. Nicht förderfähig sind u. a. Verwaltungskosten, Planungsleistungen (HOAI) sowie Grunderwerb.",
          },
        },
        {
          name: "coFinancing",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "no",
          props: {
            label: "Ko-Finanzierung",
            options: [
              { key: "no", label: "Nein" },
              {
                key: "planned",
                label: "Ja – geplant",
                description: "Bitte nachreichen sobald vorhanden",
              },
              {
                key: "approved",
                label: "Ja – bewilligt",
                description:
                  "Liegt bereits ein Bewilligungsbescheid zur Ko-Finanzierung vor, bitten wir um Upload des entsprechenden Dokuments.",
              },
            ],
          },
          // this deletes the value of fundingSource if condition is not met
          listeners: {
            onChange: ({ fieldApi }) => {
              isDev &&
                console.log(
                  `${fieldApi.name} has changed to: ${fieldApi.state.value} --> resetting conditionalCase1A`,
                )
              if (fieldApi.state.value === "no") {
                fieldApi.form.setFieldValue("fundingSource", "") // reset value of fundingSource if condition is not met
              }
            },
          },
        },
        {
          name: "fundingSource",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["conditionalOptionalString"],
          defaultValue: "",
          condition: {
            fieldName: "coFinancing",
            conditionFn: (fieldValue) => fieldValue === "planned" || fieldValue === "approved",
          },
          props: {
            label: "Ko-Finanzierung: Mittelgeber und Programm",
            description:
              "Bitte geben Sie an, wie der Eigenanteil der Kommune sowie ggf. Beiträge Dritter (z. B. andere Träger oder Förderprogramme) finanziert werden. Voraussetzung ist, dass die Gesamtfinanzierung einschließlich Folgekosten gesichert ist und durch einen Finanzierungsplan nachgewiesen wird.",
          },
        },
        {
          name: "sharedBuilding",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "no",
          props: {
            label: "Gemeinschaftsbauwerk",
            options: [
              { key: "no", label: "Nein" },
              {
                key: "yes",
                label: "Ja",
                description:
                  "Ein Gemeinschaftsbauwerk liegt vor, wenn Anlagen gemeinsam mit einem anderen Baulastträger errichtet werden (z. B. an Bahnhöfen). In diesem Fall ist vor Antragstellung eine vertragliche Regelung zur Aufteilung der Kosten zwischen den Beteiligten erforderlich.",
              },
            ],
          },
        },
        {
          name: "realisationYear",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredYearString"],
          defaultValue: "",
          props: {
            label: "Voraussichtliches Realisierungsjahr",
            description:
              "Datum im Format JJJJ, beispielsweise '2027'. Bis 31. Januar eingereichte Maßnahmen können für das Folgejahr berücksichtigt werden. Ab 1. Februar ist eine Berücksichtigung frühestens ab dem übernächsten Jahr möglich (max. bis 2031).",
          },
          // here we use validators (not superrefine) as we need the isPristine state and as we do not have the pagehaserror problem here as it is the last page of the part tbd
          validators: {
            onSubmit: validateRealisationYear,
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
          },
        },
        {
          name: "uploadsDescription",
          componentType: "form",
          component: "SurveyTextarea",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Beschreibung der Dokumente",
          },
        },
        {
          name: "contact",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Name einer zuständigen Kontaktperson",
          },
        },
        {
          name: "phone",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["optionalString"],
          defaultValue: "",
          props: {
            label: "Telefonnummer für Rückfragen",
          },
        },
        {
          name: "email",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredEmailString"],
          defaultValue: "",
          props: {
            label: "E-Mail-Adresse zur Bestätigung der Maßnahmenmeldung",
          },
        },
        {
          name: "declaration",
          component: "SurveyCheckbox",
          componentType: "form",
          validation: fieldValidationEnum["requiredTrueBoolean"],
          defaultValue: false,
          props: {
            label: "Erklärung",
            itemLabel:
              "Ich erkläre, dass ich die Sparsamkeit und Wirtschaftlichkeit bei der Maßnahmenmeldung beachtet habe.",
          },
        },
      ],
    },
  ],
}
