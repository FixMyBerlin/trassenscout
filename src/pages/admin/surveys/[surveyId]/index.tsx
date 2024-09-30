import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { Link, linkStyles } from "@/src/core/components/links"
import { quote } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/hooks"
import { LayoutArticle, MetaTags } from "@/src/core/layouts"
import deleteSurvey from "@/src/surveys/mutations/deleteSurvey"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"

export const AdminSurvey = () => {
  const router = useRouter()
  const surveyId = useParam("surveyId", "number")
  const projectSlug = useProjectSlug()
  const [deleteSurveyMutation] = useMutation(deleteSurvey)
  const [survey] = useQuery(getSurvey, { projectSlug, id: surveyId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${survey.id} unwiderruflich löschen?`)) {
      await deleteSurveyMutation({ id: survey.id })
      await router.push(Routes.Home())
    }
  }

  return (
    <>
      <MetaTags noindex title={`Survey ${quote(survey.slug)}`} />

      <h1>Survey {quote(survey.slug)}</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(survey, null, 2)}</pre>
      </SuperAdminBox>

      <Link href={Routes.AdminEditSurveyPage({ surveyId: survey.id })}>Bearbeiten</Link>

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        Löschen
      </button>
    </>
  )
}

const AdminShowSurveyPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <AdminSurvey />
      </Suspense>
    </LayoutArticle>
  )
}

AdminShowSurveyPage.authenticate = { role: "ADMIN" }

export default AdminShowSurveyPage
