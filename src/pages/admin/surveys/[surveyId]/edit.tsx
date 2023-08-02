import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SurveyForm } from "src/surveys/components/SurveyForm"
import updateSurvey from "src/surveys/mutations/updateSurvey"
import getSurvey from "src/surveys/queries/getSurvey"

const AdminEditSurvey = () => {
  const router = useRouter()
  const surveyId = useParam("surveyId", "number")
  const [survey, { setQueryData }] = useQuery(
    getSurvey,
    { id: surveyId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateSurveyMutation] = useMutation(updateSurvey)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSurveyMutation({
        id: survey.id,
        ...values,
        interestedParticipants: Number(values.interestedParticipants),
        startDate: values.startDate ? new Date(values.startDate) : null,
        endDate: values.endDate ? new Date(values.endDate) : null,
      })
      await setQueryData(updated)
      await router.push(Routes.AdminShowSurveyPage({ surveyId: updated.id }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`Survey ${survey.id} bearbeiten`} />

      <h1>Survey {survey.id} bearbeiten</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(survey, null, 2)}</pre>
      </SuperAdminBox>

      <SurveyForm submitText="Speichern" initialValues={survey} onSubmit={handleSubmit} />
    </>
  )
}

const AdminEditSurveyPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <AdminEditSurvey />
      </Suspense>

      <p>
        <Link href={Routes.AdminSurveysPage()}>Alle Surveys</Link>
      </p>
    </LayoutArticle>
  )
}

AdminEditSurveyPage.authenticate = { role: "ADMIN" }

export default AdminEditSurveyPage
