import { Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getSurveySessionWithResponses from "../../survey-sessions/queries/getSurveySessionWithResponses"
import { NotFoundError } from "blitz"

export const SurveySession = () => {
  const surveySessionId = useParam("surveySessionId", "number")
  if (surveySessionId === undefined) throw new NotFoundError()
  const [surveySession] = useQuery(getSurveySessionWithResponses, { id: surveySessionId })

  return (
    <>
      <MetaTags noindex title={`SurveySession ${surveySession.id}`} />

      <h1>SurveySession {surveySession.id}</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(surveySession, null, 2)}</pre>
      </SuperAdminBox>
    </>
  )
}

const ShowSurveySessionPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <SurveySession />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link href={Routes.SurveySessionsPage()}>Alle SurveySessions</Link>
      </p>
    </LayoutArticle>
  )
}

ShowSurveySessionPage.authenticate = true

export default ShowSurveySessionPage
