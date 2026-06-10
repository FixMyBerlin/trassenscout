import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import SurveyInactivePage from "@/src/components/beteiligung/SurveyInactivePage"
import { SurveyFRM7 } from "@/src/components/beteiligung/surveys/frm7/SurveyFRM7"
import { SurveyOhvHaltestellenfoerderung } from "@/src/components/beteiligung/surveys/ohv-haltestellenfoerderung/SurveyOhvHaltestellenfoerderung"
import { SurveyBB } from "@/src/components/beteiligung/surveys/radnetz-brandenbrug/SurveyBB"
import { SurveyRS8 } from "@/src/components/beteiligung/surveys/rs8/SurveyRS8"
import { SurveyRsTest123 } from "@/src/components/beteiligung/surveys/rstest-1-2-3/SurveyRsTest123"
import { SurveyRsTest1 } from "@/src/components/beteiligung/surveys/rstest-1/SurveyRsTest1"
import { SurveyRsTest23 } from "@/src/components/beteiligung/surveys/rstest-2-3/SurveyRsTest23"
import { SurveyRsTest2 } from "@/src/components/beteiligung/surveys/rstest-2/SurveyRsTest2"
import { Route } from "@/src/routes/beteiligung/$surveySlug/index"

function SurveyBySlug({
  surveySlug,
  surveyId,
}: {
  surveySlug: AllowedSurveySlugs
  surveyId: number
}) {
  switch (surveySlug) {
    case "frm7":
      return <SurveyFRM7 surveyId={surveyId} />
    case "rs8":
      return <SurveyRS8 surveyId={surveyId} />
    case "radnetz-brandenburg":
      return <SurveyBB surveyId={surveyId} />
    case "rstest-1-2-3":
      return <SurveyRsTest123 surveyId={surveyId} />
    case "rstest-2-3":
      return <SurveyRsTest23 surveyId={surveyId} />
    case "rstest-2":
      return <SurveyRsTest2 surveyId={surveyId} />
    case "rstest-1":
      return <SurveyRsTest1 surveyId={surveyId} />
    case "ohv-haltestellenfoerderung":
      return <SurveyOhvHaltestellenfoerderung surveyId={surveyId} />
    default:
      return null
  }
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
