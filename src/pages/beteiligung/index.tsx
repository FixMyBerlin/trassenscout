import { BlitzPage, Routes } from "@blitzjs/next"
import { Link } from "src/core/components/links"

import { ScreenHeaderParticipation } from "src/core/components/PageHeader/ScreenHeaderParticipation"
import { MetaTags } from "src/core/layouts"
import { LayoutParticipation } from "src/core/layouts/LayoutParticipation"

const ParticipationHomePage: BlitzPage = () => {
  return (
    <LayoutParticipation>
      <MetaTags noindex title="Beteiligung RS8" />
      <div>
        <ScreenHeaderParticipation
          title="Ihre Meinung ist gefragt"
          description="Auf dem Weg zur Schule, Sportstätte und Arbeitsplatz, beim Wocheneinkauf oder dem Familienausflug – unser Ziel ist, dass der Radschnellweg von vielen Menschen angenommen wird. Die Bürgerbeteiligung läuft noch bis zum X.X.2023. Die Beantwortung dauert ca. 5-10 Minuten."
        />

        <Link button="pink" href={Routes.ParticipationMainPage()}>
          {/* TODO Update link */}
          Beteiligung starten
        </Link>
      </div>
    </LayoutParticipation>
  )
}

export default ParticipationHomePage
