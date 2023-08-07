import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SurveyForm } from "src/surveys/components/SurveyForm"
import createSurvey from "src/surveys/mutations/createSurvey"
import getAdminStatus from "src/users/queries/getAdminStatus"

const AdminNewSurvey = () => {
  useQuery(getAdminStatus, {}) // See https://github.com/FixMyBerlin/private-issues/issues/936

  const router = useRouter()
  const [createSurveyMutation] = useMutation(createSurvey)
  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const survey = await createSurveyMutation({
        ...values,
        interestedParticipants: Number(values.interestedParticipants),
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
      })
      await router.push(Routes.AdminShowSurveyPage({ surveyId: survey.id }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neue Beteiligung erstellen" />
      <PageHeader title="Neuen Survey erstellen" />
      {/* TODO schema */}
      <SurveyForm submitText="Erstellen" onSubmit={handleSubmit} />
    </>
  )
}

const AdminNewSurveyPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <AdminNewSurvey />
      </Suspense>
    </LayoutArticle>
  )
}

// See https://github.com/FixMyBerlin/private-issues/issues/936
// AdminNewSurveyPage.authenticate = { role: "ADMIN" }
AdminNewSurveyPage.authenticate = true

export default AdminNewSurveyPage
