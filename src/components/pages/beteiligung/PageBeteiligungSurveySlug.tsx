import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import SurveyInactivePage from "@/src/components/beteiligung/SurveyInactivePage"
import { SurveyMainPage } from "@/src/components/beteiligung/SurveyMainPage"
import { SurveyOhvHaltestellenfoerderung } from "@/src/components/beteiligung/surveys/ohv-haltestellenfoerderung/SurveyOhvHaltestellenfoerderung"
import { SurveyBB } from "@/src/components/beteiligung/surveys/radnetz-brandenbrug/SurveyBB"
import { Route } from "@/src/routes/beteiligung/$surveySlug/index"

function SurveyBySlug({
  surveySlug,
  surveyId,
}: {
  surveySlug: AllowedSurveySlugs
  surveyId: number
}) {
  // Only surveys with custom page logic need a branch here. All others use SurveyMainPage.
  if (surveySlug === "radnetz-brandenburg") return <SurveyBB surveyId={surveyId} />
  if (surveySlug === "ohv-haltestellenfoerderung") {
    return <SurveyOhvHaltestellenfoerderung surveyId={surveyId} />
  }
  return <SurveyMainPage surveyId={surveyId} />
}

export function PageBeteiligungSurveySlug() {
  const { surveySlug } = Route.useParams()
  const survey = Route.useLoaderData()

  if (!survey) {
    return null
  }

  if (!survey.active) {
    return <SurveyInactivePage surveySlug={surveySlug} />
  }

  return <SurveyBySlug surveySlug={surveySlug} surveyId={survey.id} />
}
