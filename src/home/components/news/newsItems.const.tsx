import { Link } from "src/core/components/links"

export type TNewsItem = typeof newsItems[number]

export const newsItems = [
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
      </>
    ),
  },
  // {
  //   slug: "rs8-website",
  //   title: "Informations-Website für den Radschnellweg RS 8 veröffentlicht",
  //   date: new Date("02.04.2023"),
  //   body: (
  //     <>
  //       <p>
  //         Für den Radschnellweg 8 (RS 8) wurde die Website zur Information von interessierten
  //         Bürger:innen in gemeinsamer Arbeit von FixMyCity mit den verantwortlichen Städten und
  //         Landkreisen veröffentlicht. Sie informiert zum aktuellen Planungsstand der in Planung
  //         befindlichen Trasse zwischen Waiblingen und Ludwigsburg. Über eine Karte lässt sich die
  //         genaue Route interaktiv nachvollziehen. In einem nächsten Schritt soll eine
  //         Bürger:innenbeteiligung starten.
  //       </p>
  //       <p>
  //         <Link href="https://radschnellweg8-lb-wn.de" blank>
  //           Zur Website zum RS 8, radschnellweg8-lb-wn.de
  //         </Link>
  //       </p>
  //     </>
  //   ),
  // },
]
