import { BlitzPage } from "@blitzjs/next"
import { LayoutParticipation } from "src/participation/components/core/layout/LayoutParticipation"
import { surveyDefinition } from "src/participation/data/survey"
import { ScreenHeaderParticipation } from "./core/layout/ScreenHeaderParticipation"
import { ParticipationLink } from "./core/links/ParticipationLink"

const ParticipationInactivePage: BlitzPage = () => {
  return (
    <LayoutParticipation
      canonicalUrl={surveyDefinition.canonicalUrl}
      logoUrl={surveyDefinition.logoUrl}
    >
      <section>
        <ScreenHeaderParticipation title="Diese Umfrage ist zur Zeit nicht aktiv." />
        <ParticipationLink className="mt-32" button="white" href={surveyDefinition.canonicalUrl}>
          Zur Projektwebseite
        </ParticipationLink>
      </section>
    </LayoutParticipation>
  )
}

export default ParticipationInactivePage
