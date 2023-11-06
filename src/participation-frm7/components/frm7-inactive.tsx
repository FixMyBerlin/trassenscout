import { BlitzPage } from "@blitzjs/next"
import { LayoutParticipation } from "src/participation/components/layout/LayoutParticipation"
import surveyDefinition from "src/participation/data/survey.json"
import { ScreenHeaderParticipation } from "./layout/ScreenHeaderParticipation"
import { ParticipationLink } from "./core/links/ParticipationLink"

const ParticipationFrm7InactivePage: BlitzPage = () => {
  return (
    <LayoutParticipation
      canonicalUrl={surveyDefinition.canonicalUrl}
      logoUrl={surveyDefinition.logoUrl}
    >
      <section>
        <ScreenHeaderParticipation title="Diese Umfrage ist zur Zeit nicht aktiv." />
        <ParticipationLink
          className="mt-32"
          button="white"
          href="https://www.region-frankfurt.de/rsw"
        >
          Zur Projektwebseite
        </ParticipationLink>
      </section>
    </LayoutParticipation>
  )
}

export default ParticipationFrm7InactivePage
