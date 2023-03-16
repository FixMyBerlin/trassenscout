import { BlitzPage } from "@blitzjs/next"
import { Survey } from "src/participation/components/Survey"
import survey from "../../participation/data/survey.json"

const ParticipationMainPage: BlitzPage = () => {
  return <Survey survey={survey} />
}

export default ParticipationMainPage
