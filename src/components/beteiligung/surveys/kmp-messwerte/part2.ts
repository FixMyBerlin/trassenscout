import { fieldValidationEnum } from "@/src/components/beteiligung/shared/fieldvalidationEnum"
import type { SurveyPart2 } from "@/src/components/beteiligung/shared/types"

export const part2Config: SurveyPart2 = {
  progressBarDefinition: 1,
  intro: {
    type: "standard",
    title: "Messwerte zum Klimamobilitätsplan übermitteln",
    description: `**Landkreis Ludwigsburg**

Mit diesem Formular übermitteln Sie für Ihre Kommune Messwerte zu den Indikatoren des Klimamobilitätsplans. Die Angaben werden im Trassenscout erfasst und für das Monitoring dokumentiert.

Das Formular richtet sich an Mitarbeitende der Städte und Gemeinden im Landkreis Ludwigsburg, die diese Daten für ihre Kommune übermitteln.

## Zweck und Ziel

Der Klimamobilitätsplan des Landkreises Ludwigsburg verfolgt das Ziel, den CO₂-Ausstoß im Verkehrssektor bis 2030 um mindestens 40 Prozent gegenüber 2010 zu reduzieren.

Mit dem Monitoring wird die Entwicklung der festgelegten Indikatoren verfolgt. Ihre Angaben tragen dazu bei, die Daten Ihrer Kommune auf einer einheitlichen Grundlage im Trassenscout zu dokumentieren.

[Mehr zum Klimamobilitätsplan](https://www.landkreis-ludwigsburg.de/umwelt-technik-klimaschutz/klimaschutz-und-mobilitaet/nachhaltige-mobilitaet/klimamobilitaetsplan/)

## Welche Angaben können Sie tätigen?

- Messwert zu einem Indikator des Klimamobilitätsplans abgeben
- zeitliche Angabe sowie Erläuterungen zum Messwert
- Kontaktdetails hinterlassen

## Hinweise zur Übermittlung

Bitte füllen Sie alle Pflichtfelder aus. Optionale Angaben sind entsprechend gekennzeichnet. Prüfen Sie vor dem Absenden insbesondere den ausgewählten Indikator, den Messwert und den zeitlichen Bezug.

Nach dem Absenden werden Ihre Angaben im Trassenscout für das Monitoring erfasst.

## Kontakt für fachliche Rückfragen

Bei Fragen zu den Indikatoren oder zum Monitoring des Klimamobilitätsplans wenden Sie sich bitte an:

**[Vorname Nachname]**

Klimaschutzmanagerin

[E-Mail-Adresse]

[Telefonnummer]

## Datenschutz

Alle personenbezogenen Daten werden gemäß DSGVO verarbeitet und nur für die Durchführung dieses digitalen Formulars gespeichert. Weitere Informationen finden Sie im [Datenschutzhinweis](https://trassenscout.de/datenschutz).`,
    buttons: [
      {
        action: "next",
        label: "Messwert erfassen",
        position: "right",
        color: "primaryColor",
      },
    ],
  },
  buttonLabels: {
    next: "Weiter",
    back: "Zurück",
    submit: "Messwert übermitteln",
  },
  pages: [
    {
      id: "measurement",
      fields: [
        {
          name: "measurementTitle",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Messwerte zum Klimamobilitätsplan übermitteln" },
        },
        {
          name: "measurementDescription",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown:
              "Bitte nutzen Sie das Formular für eine Messwerterfassung. Nach erfolgreicher Übermittlung können Sie einen weiteren Messwert erfassen und absenden. Alle Felder sind Pflichtfelder, außer Name und Telefonnummer.",
          },
        },
        {
          name: "commune",
          component: "SurveySelect",
          componentType: "form",
          validation: fieldValidationEnum.requiredString,
          defaultValue: "",
          props: {
            label: "Name der meldenden Kommune",
            description: "Bitte wählen Sie die Kommune aus, für die Sie den Messwert übermitteln.",
            placeholder: "Kommune auswählen",
            options: [
              { key: "affalterbach", label: "Affalterbach" },
              { key: "asperg", label: "Asperg" },
              { key: "benningenAmNeckar", label: "Benningen am Neckar" },
              { key: "besigheim", label: "Besigheim" },
              { key: "bietigheimBissingen", label: "Bietigheim-Bissingen" },
              { key: "boennigheim", label: "Bönnigheim" },
              { key: "ditzingen", label: "Ditzingen" },
              { key: "eberdingen", label: "Eberdingen" },
              { key: "erdmannhausen", label: "Erdmannhausen" },
              { key: "erligheim", label: "Erligheim" },
              { key: "freibergAmNeckar", label: "Freiberg am Neckar" },
              { key: "freudental", label: "Freudental" },
              { key: "gemmrigheim", label: "Gemmrigheim" },
              { key: "gerlingen", label: "Gerlingen" },
              { key: "grossbottwar", label: "Großbottwar" },
              { key: "hemmingen", label: "Hemmingen" },
              { key: "hessigheim", label: "Hessigheim" },
              { key: "ingersheim", label: "Ingersheim" },
              { key: "kirchheimAmNeckar", label: "Kirchheim am Neckar" },
              { key: "korntalMuenchingen", label: "Korntal-Münchingen" },
              { key: "kornwestheim", label: "Kornwestheim" },
              { key: "loechgau", label: "Löchgau" },
              { key: "ludwigsburg", label: "Ludwigsburg" },
              { key: "marbachAmNeckar", label: "Marbach am Neckar" },
              { key: "markgroeningen", label: "Markgröningen" },
              { key: "moeglingen", label: "Möglingen" },
              { key: "mundelsheim", label: "Mundelsheim" },
              { key: "murr", label: "Murr" },
              { key: "oberriexingen", label: "Oberriexingen" },
              { key: "oberstenfeld", label: "Oberstenfeld" },
              { key: "pleidelsheim", label: "Pleidelsheim" },
              { key: "remseckAmNeckar", label: "Remseck am Neckar" },
              { key: "sachsenheim", label: "Sachsenheim" },
              { key: "schwieberdingen", label: "Schwieberdingen" },
              { key: "sersheim", label: "Sersheim" },
              { key: "steinheimAnDerMurr", label: "Steinheim an der Murr" },
              { key: "tamm", label: "Tamm" },
              { key: "vaihingenAnDerEnz", label: "Vaihingen an der Enz" },
              { key: "walheim", label: "Walheim" },
            ],
          },
        },
        {
          name: "indicator",
          component: "SurveySelect",
          componentType: "form",
          validation: fieldValidationEnum.requiredString,
          defaultValue: "",
          props: {
            label: "Indikator",
            description:
              "Bitte wählen Sie den Indikator aus, zu dem Sie einen Messwert übermitteln möchten.",
            placeholder: "Indikator auswählen",
            options: [
              { key: "radverkehrsstaerke", label: "Radverkehrsstärke" },
              {
                key: "treibhausgasemissionenImVerkehr",
                label: "Treibhausgasemissionen im Verkehr",
              },
              {
                key: "verkehrszaehlungenAnDauerzaehlstellen",
                label: "Verkehrszählungen an Dauerzählstellen",
              },
              {
                key: "modalSplitNachVerkehrsleistung",
                label: "Modal Split nach Verkehrsleistung",
              },
              { key: "flottenkennwertAntriebsarten", label: "Flottenkennwert Antriebsarten" },
              { key: "flottenkennwertKfzBestand", label: "Flottenkennwert Kfz-Bestand" },
              {
                key: "zahlDerOeffentlichZugaenglichenLadepunkte",
                label: "Zahl der öffentlich zugänglichen Ladepunkte",
              },
              { key: "sharingAngebot", label: "Sharing-Angebot" },
              { key: "oepnvZeitkartenbesitz", label: "ÖPNV-Zeitkartenbesitz" },
              {
                key: "kommunaleZusammenarbeitStaerken",
                label: "Kommunale Zusammenarbeit stärken",
              },
              {
                key: "verletzteUndGetoeteteImStrassenverkehr",
                label: "Verletzte und Getötete im Straßenverkehr",
              },
              {
                key: "zufriedenheitMitDemSicherheitsgefuehlNachVerkehrsmitteln",
                label: "Zufriedenheit mit dem Sicherheitsgefühl nach Verkehrsmitteln",
              },
              {
                key: "betroffenePersonenVonGrenzwertueberschreitenderLaermbelastung",
                label: "Betroffene Personen von grenzwertüberschreitender Lärmbelastung",
              },
              {
                key: "zufriedenheitswertLebensqualitaetImLandkreis",
                label: "Zufriedenheitswert Lebensqualität im Landkreis",
              },
            ],
          },
        },
        {
          name: "feedbackText",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum.requiredString,
          defaultValue: "",
          props: {
            label: "Messwert",
            description: "Bitte geben Sie hier Ihren erfassten Messwert ein.",
          },
        },
        {
          name: "measurementDate",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum.requiredString,
          defaultValue: "",
          props: {
            label: "Messdatum",
            description:
              "Bitte geben Sie den Stichtag oder den Zeitraum an, auf den sich der Messwert bezieht.",
          },
        },
        {
          name: "contact",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum.optionalString,
          defaultValue: "",
          props: { label: "Name der zuständigen Kontaktperson", autoComplete: "name" },
        },
        {
          name: "phone",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum.optionalString,
          defaultValue: "",
          props: { label: "Telefonnummer", type: "tel", autoComplete: "tel" },
        },
        {
          name: "email",
          component: "SurveyTextfield",
          componentType: "form",
          validation: fieldValidationEnum.requiredEmailString,
          defaultValue: "",
          props: {
            label: "E-Mail-Adresse zur Bestätigung der Messwerterfassung",
            type: "email",
            autoComplete: "email",
          },
        },
        {
          name: "comment",
          component: "SurveyTextarea",
          componentType: "form",
          validation: fieldValidationEnum.requiredString,
          defaultValue: "",
          props: { label: "Kommentar" },
        },
      ],
    },
  ],
}
