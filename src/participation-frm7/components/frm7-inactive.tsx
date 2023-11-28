import { BlitzPage } from "@blitzjs/next"
import { LayoutParticipation } from "src/participation/components/core/layout/LayoutParticipation"
import { surveyDefinition } from "src/participation-frm7/data/survey"

import { ParticipationLink } from "src/participation/components/core/links/ParticipationLink"
import { ScreenHeaderParticipation } from "src/participation/components/core/layout/ScreenHeaderParticipation"

const ParticipationFrm7InactivePage: BlitzPage = () => {
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

export default ParticipationFrm7InactivePage
