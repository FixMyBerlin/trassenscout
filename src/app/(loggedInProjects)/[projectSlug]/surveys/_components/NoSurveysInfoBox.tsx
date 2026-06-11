import { SurveyP } from "@/src/app/beteiligung/_components/Text"
import { Link } from "@/src/core/components/links"

export const NoSurveysInfoBox = () => {
  return (
    <section>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 md:gap-y-8">
        <div className="flex min-w-0 flex-col gap-6">
          <SurveyP className="my-0!">
            Der Bereich „Beteiligung“ füllt sich automatisch, sobald Sie ein digitales Verfahren
            anlegen, aktivieren oder ein abgeschlossenes Projekt archivieren. Das Tool ist
            hochflexibel und wird individuell an Ihre speziellen Bedürfnisse angepasst.
          </SurveyP>

          <div>
            <SurveyP className="my-0! mb-4">Erfolgreiche Einsatzbeispiele aus der Praxis:</SurveyP>
            <ul className="list-disc space-y-2 pl-6 text-base text-gray-700">
              <li>
                <span className="underline">Bürgerbeteiligung zu Radschnellverbindungen 8:</span>{" "}
                Gezielte Abfrage von Meinungen, Hinweise und Anregungen.
              </li>
              {/* <li>
                <span className="underline">
                  Förderprogramm Bushaltestellen (Landkreis Oberhavel):
                </span>{" "}
                Digitalisiertes Meldeverfahren für Kommunen zur Vorprüfung und Priorisierung von
                ÖPNV-Infrastrukturmaßnahmen nach Landesrichtlinie.
              </li> */}
              <li>
                <span className="underline">Landesweites Radnetz (Brandenburg):</span>{" "}
                Online-Beteiligung von über 200 Ämtern und Trägern öffentlicher Belange (TÖB). Über
                1.200 fachspezifische Rückmeldungen wurden digital erfasst und direkt in die
                Netzentwicklung eingearbeitet.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <SurveyP className="my-0!">
            <strong>Was bietet Ihnen dieser Bereich?</strong> Er liefert eine kompakte Übersicht der
            Eckdaten sowie aller Eingaben. Selbst bei großen Verfahren können Sie Hinweise effizient
            kategorisieren, filtern und systematisch dokumentieren. So behalten Sie stets den
            Überblick und beschleunigen Ihre Planungsprozesse.
          </SurveyP>

          <SurveyP className="my-0!">
            Erfahren Sie mehr über die Vorteile von Beteiligungen über die{" "}
            <Link blank href="https://fixmycity.de/dienstleistungen/#beteiligung">
              FixMyCity-Webseite
            </Link>{" "}
            oder über <Link href="/support">Support & Dokumentation</Link>.
          </SurveyP>
        </div>
      </div>
    </section>
  )
}
