import communes_bboxes from "@/src/app/beteiligung/_ohv-haltestellenfoerderung/communes_bboxes.json"
import { mapData } from "@/src/app/beteiligung/_ohv-haltestellenfoerderung/mapData.const"
import { fieldValidationEnum } from "@/src/app/beteiligung/_shared/fieldvalidationEnum"
import {
  geoCategorySetInitialBoundsDefinition,
  SurveyPart2,
} from "@/src/app/beteiligung/_shared/types"

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 2,
  intro: {
    type: "standard",
    title: "Maßnahmenmeldung für Bushaltestellen und Businfrastruktur im Landkreis Oberhavel",
    description: `Der Landkreis Oberhavel stellt im Rahmen seines 5-Jahresprogramms zur Förderung des ÖPNV, insbesondere im Bereich der Haltestellen- und Businfrastruktur, ein systematisiertes und digitales Verfahren zur Maßnahmenmeldung durch die Kommunen zur Verfügung.

Im Rahmen dieses Projekts wird nun diese Plattform für das landkreisweite Förderverfahren im Bereich des ÖPNV eingesetzt. Ziel ist es, die Qualität der kommunalen Eingaben zu erhöhen, die interne Prüfung und Weiterverarbeitung zu vereinfachen und Grundlagen für die spätere Förderantragstellung zu schaffen.

## Förderlinie

Grundlage für die Maßnahmenmeldung ist die Förderrichtlinie des Landes Brandenburg zur Verbesserung der Infrastruktur im öffentlichen Personennahverkehr. Im Fokus stehen kommunale Maßnahmen, die zur Attraktivitätssteigerung und besseren Nutzbarkeit des ÖPNV beitragen.

Die Förderlinie verfolgt das Ziel, die Mobilität in der Region zu stärken, klimafreundliche Verkehrsangebote auszubauen und die Erreichbarkeit im ländlichen Raum zu sichern. Voraussetzung für eine Förderung ist die nachvollziehbare Begründung des Bedarfs, eine Einordnung in kommunale oder regionale Planungen sowie die Einhaltung technischer und qualitativer Standards.

Bitte beachten Sie: Die Maßnahmenmeldung über dieses Formular stellt noch keinen Förderantrag dar. Sie dient als strukturierte Vorprüfung im Rahmen des Landkreiskonzepts und bildet die Grundlage für die Auswahl und Priorisierung der Projekte im Rahmen des jährlichen Fortschreibungsprozesses.

## Fördergegenstand

Die Kommunen können Maßnahmenvorschläge zu allen förderfähigen Gegenständen gemäß Ziffer 2.1 der Förderrichtlinie eintragen. Dazu gehören:
- Bau oder Ausbau von Zentralen Omnibusbahnhöfen (ZOB)
- Haltestelleneinrichtungen
- Buswendeschleifen und Bahnhofsvorplätze
- Park-and-Ride- (P&R) und Bike-and-Ride-Anlagen (B&R)
- Beschleunigungsmaßnahmen für den ÖPNV

## Fristen

Die Beteiligung läuft noch bis zum 30.09.2025. Bis dahin können Sie auf dem gleichen Wege noch weitere Maßnahmen melden. Nach Abschluss des Meldeverfahrens werden die eingegangenen Meldungen durch die OHV gesichtet und in Rücksprache mit dem Landkreis geprüft. Die Entscheidung über die Aufnahme in das 5-Jahresprogramm liegt beim Landkreis. Der Landkreis zieht ggf. intern weitere Abteilungen hinzu, wie z. B. für Schulwegsicherheit.

Nach Erstellung des Maßnahmenprogramms wird dieses per E-Mail an die Kommunen übermittelt. Die E-Mail enthält als Anlage die Zusammenstellung der aufgenommenen Maßnahmen. Die Kommunen erhalten auf dieser Grundlage in einem gesonderten Schritt die Aufforderung zur Antragstellung.

## Kontakt

Sollte es noch unbeantwortete Fragen oder Schwierigkeiten bei der Beteiligung geben, können Sie den  Landkreis Oberhavel kontaktieren. Antworten auf häufig gestellte Fragen finden Sie am dieser Seite.

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
Die Maßnahmenmeldung wird nicht zwischengespeichert, d.h. bei Verlassen der Seite gehen alle eingetragenen Informationen verloren. Nach dem Absenden der Beteiligung können Sie nicht mehr auf Ihre getätigten Eingaben zugreifen. Deshalb ist es sinnvoll die Maßnahmenmeldung erst dann auszufüllen und abzusenden, sobald Sie alle wichtigen Informationen für die Maßnahmenmeldung beisammen haben. Folgende Informationen werden im Rahmen der Maßnahmenmeldung abgefragt:
- Auswahl des Fördergegenstands
- Bezug zu vorhandener Haltestelle durch Auswahl auf Karte
- Maßnahmenbeschreibung und Zielsetzung
- Angaben zum geschätzten Kostenaufwand
- Upload-Möglichkeit für ergänzende Dateien (z. B. Skizzen oder Bilder)
- Name der meldenden Kommune
- Name, Telefonnummer und E-Mail-Adresse der zuständigen Kontaktperson

Mit dem Aufrufen des Formulars stimme ich der [Datenschutzerklärung](https://trassenscout.de/datenschutz) zu. Die Daten werden gemäß DSGVO verarbeitet und nur für die Durchführung dieser Beteiligung gespeichert.`,
    buttons: [
      { action: "next", label: "Maßnahme melden", position: "right", color: "primaryColor" },
    ],
  },
  buttonLabels: {
    next: "Weiter",
    back: "Zurück",
    again: "Weitere Maßnahme melden",
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
            markdown: `Bitte nutzen Sie das Formular für jeweils nur eine Maßnahmenmeldung. Sie können weitere Maßnahmenmeldungen in einem weiteren Schritt hinzufügen und absenden.

Die Meldung wird nicht zwischengespeichert, d.h. bei dem Verlassen der Seite gehen alle eingetragenen Informationen verloren. Nach dem Absenden der Maßnahmenmeldung können Sie nicht mehr auf Ihre getätigten Eingaben zugreifen.

**Wählen Sie eine Bushaltestelle aus, zu der Sie Maßnahmenvorschläge geben möchten!**

Wählen Sie eine Bushaltestelle durch Klicken auf den gewünschten orangen Punkt auf der Karte aus. Nun können Sie zu der gewählten Bushaltestelle eine Maßnahme melden.

Bei Bedarf können Sie die Ansicht der Karte verschieben oder über “+/-” verkleinern oder vergrößern.`,
          },
        },
        {
          name: "category",
          componentType: "form",
          component: "SurveyRadiobuttonGroup",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Bitte wählen Sie den Fördergegenstand aus!",
            options: [
              { key: "zob", label: "Bau oder Ausbau von Zentralen Omnibusbahnhöfen (ZOB)" },
              { key: "haltestelleneinrichtungen", label: "Haltestelleneinrichtungen" },
              { key: "buswendeschleifen", label: "Buswendeschleifen und Bahnhofsvorplätze" },
              { key: "pAndR", label: "Park-and-Ride- (P&R) und Bike-and-Ride-Anlagen (B&R)" },
              { key: "beschleunigung", label: "Beschleunigungsmaßnahmen für den ÖPNV" },
            ],
          },
        },
        {
          name: "commune",
          component: "SurveyReadonlyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Name der meldenden Kommune",
            description: "Dieses Feld wird automatisch ausgefüllt.",
            // placeholder: "Kommune auswählen",
            queryId: "commune",
            // options: [
            //   { key: "hennigsdorf", label: "Hennigsdorf" },
            //   { key: "oranienburg", label: "Oranienburg" },
            //   { key: "velten", label: "Velten" },
            //   { key: "hohenneuendorf", label: "Hohen Neuendorf" },
            //   { key: "zehdenick", label: "Zehdenick" },
            //   { key: "kremmen", label: "Kremmen" },
            //   { key: "fuerstenberg", label: "Fürstenberg(Havel)" },
            //   { key: "liebenwalde", label: "Liebenwalde" },
            //   { key: "muehlenbeckerland", label: "Mühlenbecker Land" },
            //   { key: "glienickenordbahn", label: "Glienicke/Nordbahn" },
            //   { key: "oberkrämer", label: "Oberkrämer" },
            //   { key: "loewenbergerland", label: "Löwenberger Land" },
            //   { key: "birkenwerder", label: "Birkenwerder" },
            //   { key: "leegebruch", label: "Leegebruch" },
            // ],
          },
        },
        {
          name: "geometryCategory",
          componentType: "form",
          component: "SurveyGeoCategoryMapWithLegend",
          validation: fieldValidationEnum["requiredString"],
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
                  className: "!h-2 !w-2 rounded-full flex-shrink-0",
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
          name: "routeIds",
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
          name: "costs",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Kostenschätzung",
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
            label: "Emailadresse zur Bestätigung der Maßnahmenmeldung",
          },
        },
      ],
    },
  ],
}
