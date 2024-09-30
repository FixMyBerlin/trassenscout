import { TEmail } from "@/src/survey-public/components/types"

export const emailDefinition: TEmail = {
  title: { de: "Vielen Dank für Ihre Teilnahme!" },
  description: {
    de: `Vielen Dank für Ihre Teilnahme. Ihre Hinweise sind bei uns eingegangen und wurden gespeichert. Sie haben für jeden Ihrer Hinweise zur Bestätigung eine E-Mail erhalten.

## Wie geht es weiter?

Die Beteiligung läuft noch **bis zum 8. November 2024**. Bis dahin können Sie auf dem gleichen Wege noch weitere Hinweise einreichen. Nach Abschluss der Beteiligung werden alle Hinweise fachlich geprüft und vom Planungsbüro bearbeitet. Alle Hinweise fließen in die Abwägung zur Überarbeitung des Zielnetzentwurfs mit ein. Nach Abschluss der Auswertung werden die Hinweise und Rückmeldungen für alle Beteiligten im Radverkehrsatlas veröffentlicht.

## Noch Fragen?

Bei Rückfragen zur Beteiligung oder technischen Schwierigkeiten können Sie sich gerne an die beim durchführenden Unternehmen FixMyCity zuständige Mitarbeiterin, Frau Noemi Kuß, wenden.

Mail: [radnetz-brandenburg@fixmycity.de](mailto:radnetz-brandenburg@fixmycity.de),
Tel.: 030-62939269

Weiterführende Informationen zum Radnetz Brandenburg finden Sie außerdem auf der Website des Ministeriums für Infrastruktur und Landesplanung.

`,
  },
  homeUrl:
    "https://mil.brandenburg.de/mil/de/themen/mobilitaet-verkehr/radverkehr/radnetz-brandenburg/",
  button: {
    label: { de: "Zur Radnetz Brandenburg Website" },
    color: "primaryColor",
  },
}
