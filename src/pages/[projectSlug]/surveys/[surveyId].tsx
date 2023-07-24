import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import deleteSurvey from "src/surveys/mutations/deleteSurvey"
import getSurvey from "src/surveys/queries/getSurvey"
import { useSlugs } from "src/core/hooks"

export const Survey = () => {
  const { projectSlug } = useSlugs()
  const router = useRouter()
  const surveyId = useParam("surveyId", "number")
  const [deleteSurveyMutation] = useMutation(deleteSurvey)
  const [survey] = useQuery(getSurvey, { id: surveyId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${survey.id} unwiderruflich löschen?`)) {
      await deleteSurveyMutation({ id: survey.id })
      await router.push(Routes.SurveysPage({ projectSlug: projectSlug! }))
    }
  }

  return (
    <>
      <MetaTags noindex title={`Survey ${quote(survey.slug)}`} />

      <h1>Survey {quote(survey.slug)}</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(survey, null, 2)}</pre>
      </SuperAdminBox>

      <Link href={Routes.EditSurveyPage({ projectSlug: projectSlug!, surveyId: survey.id })}>
        Bearbeiten
      </Link>

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        Löschen
      </button>
    </>
  )
}

const ShowSurveyPage = () => {
  const { projectSlug } = useSlugs()
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <Survey />
      </Suspense>

      <p>
        <Link href={Routes.SurveysPage({ projectSlug: projectSlug! })}>Alle Surveys</Link>
      </p>
    </LayoutRs>
  )
}

ShowSurveyPage.authenticate = { role: "ADMIN" }

export default ShowSurveyPage
