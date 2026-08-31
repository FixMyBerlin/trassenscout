import { Link } from "@/src/components/core/components/links/Link"

export type TNewsItem = (typeof newsItems)[number]

export const newsItems = [
  {
    slug: "redesign-mobile-nutzung",
    title: "Neues Design und bessere mobile Nutzung",
    date: "2026-08-12",
    body: (
      <>
        <p>
          Der Trassenscout ist kompakter und aufgeräumter geworden, sodass wichtige Informationen
          schneller erreichbar sind und weniger gescrollt werden muss. Tabellen, Formulare und
          Bedienelemente wurden außerdem für kleinere Bildschirme und Tablets optimiert.
        </p>
      </>
    ),
  },
  {
    slug: "karten-listenansichten",
    title: "Karten und Listen arbeiten jetzt zusammen",
    date: "2026-08-12",
    body: (
      <>
        <p>
          Auf Übersichtsseiten kann flexibel zwischen Karten-, Listen- und geteilten Ansichten
          gewechselt werden. Die Karte zentriert sich automatisch auf ausgewählte Inhalte und fasst
          bei vielen Einträgen nah beieinander Markierungen übersichtlich zusammen.
        </p>
      </>
    ),
  },
  {
    slug: "umfragen-auswerten",
    title: "Umfragen einfacher auswerten und zugänglicher gestalten",
    date: "2026-08-12",
    body: (
      <>
        <p>
          Rückmeldungen aus Beteiligungen lassen sich jetzt gezielter filtern, nach Schlagworten
          sortieren und direkt als CSV exportieren. Verbesserte Kontraste und optimierte
          Formularfelder erleichtern außerdem die Teilnahme an Online-Beteiligungen.
        </p>
      </>
    ),
  },
  {
    slug: "dokumente-einfacher-hochladen-verwalten",
    title: "Dokumente einfacher hochladen und verwalten",
    date: "2026-08-12",
    body: (
      <>
        <p>
          Dateien können jetzt per Drag-and-drop direkt in die Dokumentenübersicht hochgeladen
          werden. Beim erneuten Hochladen gleichnamiger Dateien ergänzt der Trassenscout automatisch
          eine Nummerierung – für eine einfachere und übersichtlichere Dateiverwaltung.
        </p>
      </>
    ),
  },
  {
    slug: "pdf-viewer",
    title: "PDFs direkt im Trassenscout ansehen",
    date: "2026-06-01",
    body: (
      <>
        <p>
          Hochgeladene PDFs können jetzt direkt im Trassenscout in einer Vollbildansicht geöffnet
          werden. Mit einem Zoom von bis zu 500 Prozent lassen sich auch Details in Plänen,
          Verträgen und anderen umfangreichen Dokumenten prüfen.
        </p>
      </>
    ),
  },
  {
    slug: "protokollvorlagen-dokumente-verknuepfen",
    title: "Vorlagen für Protokolle und flexiblere Dokumentverknüpfungen",
    date: "2026-05-27",
    body: (
      <>
        <p>
          Für wiederkehrende Dokumentationsprozesse können jetzt Vorlagen für Protokolleinträge
          hinterlegt werden. Dokumente lassen sich außerdem mehreren Verhandlungsflächen und
          Einträgen zuordnen – für eine einheitlichere und besser verknüpfte Projektdokumentation.
        </p>
      </>
    ),
  },
  {
    slug: "planungsdaten-importieren",
    title: "Planungsdaten gesammelt importieren",
    date: "2026-05-06",
    body: (
      <>
        <p>
          Planungsräume und Planungsabschnitte können jetzt gesammelt in den Trassenscout importiert
          werden. Besonders bei größeren Projekten reduziert das den Aufwand für die erstmalige
          Einrichtung und erleichtert die Übernahme vorhandener Planungsdaten.
        </p>
      </>
    ),
  },
  {
    slug: "grunderwerb-verhandlungsflaechen",
    title: "Grunderwerb digital organisieren",
    date: "2026-04-21",
    body: (
      <>
        <p>
          Mit dem neuen Modul für den Grunderwerb können Verhandlungsflächen auf Basis von
          ALKIS-Flurstücksdaten angelegt und verwaltet werden. Statusfarben machen den aktuellen
          Stand sichtbar und Dokumente sowie Protokolle können direkt den jeweiligen Flächen
          zugeordnet werden.
        </p>
      </>
    ),
  },
  {
    slug: "meldungen-verwalten-auswerten",
    title: "Maßnahmen einfacher melden, verwalten und auswerten",
    date: "2026-03-31",
    body: (
      <>
        <p>
          Meldeverfahren können jetzt mehrere Fördergegenstände pro Maßnahme abbilden und vergeben
          automatisch eindeutige Referenznummern. Für die weitere Bearbeitung lassen sich alle
          gemeldeten Maßnahmen gesammelt als CSV exportieren und nach Kategorien filtern.
        </p>
      </>
    ),
  },
  {
    slug: "karten-zeichenwerkzeuge",
    title: "Verbesserte Karten- und Zeichenwerkzeuge",
    date: "2026-02-17",
    body: (
      <>
        <p>
          Die Karten- und Zeichenwerkzeuge wurden umfassend überarbeitet. Verbesserte
          Zeichenhinweise und zusätzliche Mittelpunkte erleichtern insbesondere das Erfassen und
          Bearbeiten von Linien und Trassen. Auch die Darstellung von Planungsabschnitten und
          Einträgen wurde vereinheitlicht.
        </p>
      </>
    ),
  },
  {
    slug: "projektprotokolle-uebersichtlicher",
    title: "Projektprotokolle übersichtlicher prüfen und bearbeiten",
    date: "2026-01-21",
    body: (
      <>
        <p>
          Projektprotokolle sind jetzt klarer nach ihrem Bearbeitungsstand gegliedert. Noch zu
          bestätigende Einträge werden von bereits bestätigten Protokolleinträgen getrennt und
          Protokolle können komfortabler direkt aus der jeweiligen Ansicht erstellt und bearbeitet
          werden.
        </p>
      </>
    ),
  },
  {
    slug: "ki-dokumente-emails",
    title: "KI unterstützt bei Dokumenten und E-Mails",
    date: "2025-12-19",
    body: (
      <>
        <p>
          Neue KI-Funktionen unterstützen bei der Verarbeitung von Projektinformationen.
          Dokumente können automatisch zusammengefasst und E-Mails inklusive Anhängen für die
          Projektdokumentation aufbereitet werden. Die Funktionen befinden sich aktuell noch in
          einer Alpha-Phase.
        </p>
      </>
    ),
  },
  {
    slug: "dokumente-gemeinsam-bearbeiten",
    title: "Dokumente gemeinsam bearbeiten und einfacher hochladen",
    date: "2025-12-18",
    body: (
      <>
        <p>
          Dokumente können jetzt für die gemeinsame Bearbeitung freigegeben werden. Gleichzeitig
          wurde der Datei-Upload verbessert: Bis zu zehn Dateien lassen sich gemeinsam hochladen,
          Ladezustände und Fehlermeldungen sind übersichtlicher und auch die mobile Nutzung wurde
          optimiert.
        </p>
      </>
    ),
  },
  {
    slug: "release-2025-09-16",
    title: "Neue Funktionen im Trassenscout",
    date: "2025-09-16",
    body: (
      <>
        <p>
          Mit dem aktuellen Release hat sich im Trassenscout einiges getan. Nutzer:innen profitieren
          von einer neuen Filterfunktion für Fortschrittsprotokolle, präziseren Längenangaben in
          Metern sowie einer überarbeiteten Eingabe von Maßnahmen. Auch die Qualitätsstandards und
          die Einladungsverwaltung wurden verbessert, um die Zusammenarbeit in Projekten noch
          effizienter zu gestalten.
        </p>
      </>
    ),
  },

  {
    slug: "massnahmenverwaltung-2025",
    title: "Digitale Maßnahmenverwaltung für Förderprogramme",
    date: "2025-08-01",
    body: (
      <>
        <p>
          Der Trassenscout unterstützt jetzt auch die digitale Erfassung und Verwaltung von
          Fördermaßnahmen. Kommunen und Verwaltungen können Projekte online melden, prüfen und
          koordinieren – für mehr Transparenz und strukturierte Abläufe bei Planung und Umsetzung.
        </p>
      </>
    ),
  },
  {
    slug: "machbarkeitsstudien-import",
    title: "Automatischer Import von Machbarkeitsstudien in Vorbereitung",
    date: "2025-03-10",
    body: (
      <>
        <p>
          Künftig sollen Inhalte aus Machbarkeitsstudien automatisiert in den Trassenscout
          übernommen werden. Damit wird die Übertragung bestehender Planungsdaten vereinfacht und
          die Weiterarbeit an Projekten beschleunigt.
        </p>
      </>
    ),
  },
  {
    slug: "radnetz-brandenburg-abschluss",
    title: "Starke Beteiligung: Über 1.000 Hinweise zum Radnetz Brandenburg eingegangen",
    date: "2024-11-22",
    body: (
      <p>
        Die Beteiligung zum Radnetz Brandenburg ist erfolgreich abgeschlossen. Mehr als 130 Städte,
        Gemeinden und Ämter haben sich eingebracht und über 1.000 Hinweise eingereicht. Der
        Trassenscout ermöglichte dabei eine gezielte und datengestützte Beteiligung auf Landesebene.
        Die Rückmeldungen fließen nun in die Weiterentwicklung des landesweiten Radnetzes ein.
      </p>
    ),
  },
  {
    slug: "igp-projektstart",
    title: "Trassenscout wird für Stromtrassen erweitert",
    date: "2024-11-01",
    body: (
      <p>
        Zum 1. November ist das neue vom BMWK geförderte Projekt im Rahmen des Innovationsprogramms
        (IGP) gestartet. FixMyCity entwickelt den Trassenscout weiter – für die Planung von Strom-,
        Bahn- und perspektivisch Wasserstofftrassen. Ziel ist es, interkommunale Projekte
        datenbasiert, transparent und beteiligungsorientiert zu steuern.
      </p>
    ),
  },
  {
    slug: "radnetz-brandenburg-start",
    title: "Startschuss für die Beteiligung zum Radnetz Brandenburg",
    date: "2024-09-30",
    body: (
      <>
        <p>
          Das Land Brandenburg hat die Kommunen eingeladen, aktiv an der Weiterentwicklung des
          landesweiten Radnetzes mitzuwirken. Über den Trassenscout konnten Städte, Gemeinden und
          Ämter ihre Perspektiven und Hinweise zu geplanten Routen und Zielen einbringen. Das
          Beteiligungsmodul bot eine digitale, intuitive Plattform zur Abstimmung und zur
          konstruktiven Mitgestaltung eines zukunftsfähigen Radnetzes.
        </p>
        <p>
          Weitere Informationen:{" "}
          <Link
            href="https://mil.brandenburg.de/mil/de/themen/mobilitaet-verkehr/radverkehr/konzept-radnetz-brandenburg/"
            blank
          >
            Website des MIL Brandenburg
          </Link>
        </p>
      </>
    ),
  },
  {
    slug: "regioprozess-start",
    title: "Projektstart: RegioProzess erforscht digitale Werkzeuge für die Verkehrswende",
    date: "2024-08-01",
    body: (
      <>
        <p>
          Mit dem Start des BMBF-geförderten Forschungsprojekts RegioProzess ist der Trassenscout
          Teil eines bundesweiten Vorhabens zur Beschleunigung der regionalen Verkehrswende. Ziel
          des Projekts ist es, die Zusammenarbeit zwischen Kommunen zu stärken, Planungsprozesse
          effizienter zu gestalten und digitale Werkzeuge zur Umsetzung nachhaltiger
          Mobilitätsmaßnahmen zu entwickeln.
        </p>
        <p>
          FixMyCity bringt den Trassenscout in drei Modellregionen – RegioPole Bielefeld,
          Regierungspräsidium Stuttgart und Landkreis Oberhavel – für den Radverkehr und den ÖPNV in
          die Anwendung.
        </p>
        <p>
          Weitere Informationen:{" "}
          <Link href="https://difu.de/projekte/die-regionale-verkehrswende-beschleunigen" blank>
            Projektseite bei difu.de
          </Link>
        </p>
      </>
    ),
  },
  {
    slug: "darmstadt-seminar",
    title: "Vorstellung des Trassenscouts in Darmstadt auf Einladung des BALM",
    date: "2024-06-12",
    body: (
      <>
        <p>
          Beim Vertiefungsseminar in Darmstadt zeigte FixMyCity den Trassenscout als Best-Practice
          für digitale Planung und Beteiligung in komplexen Verkehrsprojekten. Eingeladen hatte das
          Mobilitätsforum Bund.
        </p>
        <p>
          Weitere Informationen:{" "}
          <Link
            href="https://www.mobilitaetsforum.bund.de/SharedDocs/Termine/DE/Radverkehr-Vertiefungsseminare/A3-2024/A3-2024-06-12-13-Darmstadt.html"
            blank
          >
            Veranstaltung beim Mobilitätsforum
          </Link>
        </p>
      </>
    ),
  },
  {
    slug: "osnabrueck-seminar",
    title: "Trassenscout beim Fachseminar in Osnabrück präsentiert",
    date: "2024-05-28",
    body: (
      <>
        <p>
          In Osnabrück präsentierte FixMyCity den Trassenscout als Beispiel für digitale Werkzeuge
          zur Beteiligung und Koordination im Radverkehr – eingeladen vom Mobilitätsforum Bund.
        </p>
        <p>
          Weitere Informationen:{" "}
          <Link
            href="https://www.mobilitaetsforum.bund.de/SharedDocs/Termine/DE/Radverkehr-Vertiefungsseminare/A3-2024/A3-2024-05-28-29-Osnabrueck.html"
            blank
          >
            Veranstaltung beim Mobilitätsforum
          </Link>
        </p>
      </>
    ),
  },
  {
    slug: "frm7-beteiligung",
    title: "854 Teilnahmen: Beteiligung zum Radschnellweg FRM7 erfolgreich abgeschlossen",
    date: "2024-05-13",
    body: (
      <>
        <p>
          Im Rahmen der Machbarkeitsstudie zum geplanten Radschnellweg FRM7 im Rhein-Main-Gebiet
          konnten Bürgerinnen und Bürger vom 13. Mai bis 3. Juni 2024 ihre Hinweise und Ideen online
          einreichen. Insgesamt haben sich 854 Personen beteiligt. Die Eingaben lieferten wichtige
          Hinweise auf bevorzugte Routenführungen, Lücken im Netz, gewünschte Verbindungen und
          konkrete Problemstellen vor Ort. Die Auswertung der Beteiligung fließt nun in die weitere
          Planung ein.
        </p>
        <p>
          Weitere Informationen:{" "}
          <Link href="https://www.radschnellweg-frm7.de/beteiligung" target="_blank">
            Beteiligungsseite FRM7
          </Link>
        </p>
      </>
    ),
  },
  {
    slug: "essen-seminar",
    title: "FixMyCity stellt Trassenscout in Essen vor",
    date: "2024-04-25",
    body: (
      <>
        <p>
          Auf Einladung des Mobilitätsforums Bund stellte FixMyCity den Trassenscout beim
          Vertiefungsseminar in Essen vor. Der Fokus lag auf interkommunaler Abstimmung bei
          Radschnellverbindungen.
        </p>
        <p>
          Weitere Informationen:{" "}
          <Link
            href="https://www.mobilitaetsforum.bund.de/SharedDocs/Termine/DE/Radverkehr-Vertiefungsseminare/A3-2024/A3-2024-04-25-26-Essen.html"
            blank
          >
            Veranstaltung beim Mobilitätsforum
          </Link>
        </p>
      </>
    ),
  },
  {
    slug: "rs8-beteiligung",
    title: "Hinweise zum RS8: Beteiligung in der Region Ludwigsburg abgeschlossen",
    date: "2023-06-30",
    body: (
      <>
        <p>
          Im Rahmen der Machbarkeitsstudie für den geplanten Radschnellweg RS8 konnten Bürgerinnen
          und Bürger ihre Ideen, Hinweise und Anliegen online über den Trassenscout einreichen. Die
          Beteiligung wurde gemeinsam mit den Städten Ludwigsburg, Remseck und Waiblingen sowie den
          Landkreisen Ludwigsburg und Rems-Murr-Kreis durchgeführt. Ziel war es, lokale Perspektiven
          frühzeitig in die Planung einzubinden.
        </p>
        <p>
          Die Hinweise werden nun ausgewertet und fließen in die weitere Ausarbeitung der
          Trassenkorridore ein. Eine Übersicht der Rückmeldungen ist auf der Projektwebsite
          abrufbar.
        </p>
        <p>
          Weitere Informationen:{" "}
          <Link href="https://radschnellweg8-lb-wn.de/beteiligung/" target="_blank">
            Beteiligungsseite RS8
          </Link>
        </p>
      </>
    ),
  },
  {
    slug: "launch",
    title: "Erste Version des Trassenscout erfolgreich gelauncht",
    date: "2023-02-02",
    body: (
      <>
        <p>
          Die erste Version des Trassenscout wurde in Zusammenarbeit mit den Städten Ludwigsburg,
          Waiblingen, Remseck, den Landkreisen Ludwigsburg und dem Rems-Murr-Kreis gelauncht. Der
          Trassenscout geht auf ein Forschungsprojekt zu Beteiligungsverfahren bei
          Radschnellverbindungen zurück, welches gefördert wird durch das Bundesministerium für
          Verkehr und Daten (BMDV) im Rahmen des Förderprogramms Nationaler Radverkehrsplan.
        </p>
        <p>
          Weitere Informationen:{" "}
          <Link href="https://radschnellweg8-lb-wn.de" target="_blank">
            Projektseite RS8
          </Link>
        </p>
      </>
    ),
  },
]
