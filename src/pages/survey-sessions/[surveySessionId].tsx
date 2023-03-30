import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { quote } from "src/core/components/text"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import deleteSurveySession from "src/survey-sessions/mutations/deleteSurveySession"
import getSurveySessionWithResponses from "../../survey-sessions/queries/getSurveySessionWithResponses"

export const SurveySession = () => {
  const router = useRouter()
  const surveySessionId = useParam("surveySessionId", "number")
  const [deleteSurveySessionMutation] = useMutation(deleteSurveySession)
  const [surveySession] = useQuery(getSurveySessionWithResponses, { id: surveySessionId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${surveySession.id} unwiderruflich löschen?`)) {
      await deleteSurveySessionMutation({ id: surveySession.id })
      await router.push(Routes.SurveySessionsPage())
    }
  }

  return (
    <>
      <MetaTags noindex title={`SurveySession ${quote(surveySession.id)}`} />

      <h1>SurveySession {quote(surveySession.id)}</h1>
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

      <p>
        <Link href={Routes.SurveySessionsPage()}>Alle SurveySessions</Link>
      </p>
    </LayoutArticle>
  )
}

ShowSurveySessionPage.authenticate = true

export default ShowSurveySessionPage
