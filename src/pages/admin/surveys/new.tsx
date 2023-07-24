import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { Spinner } from "src/core/components/Spinner"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createSurvey from "src/surveys/mutations/createSurvey"
import { SurveyForm, FORM_ERROR } from "src/surveys/components/SurveyForm"
import { Link } from "src/core/components/links"
import { Suspense } from "react"

const NewSurvey = () => {
  const router = useRouter()
  const [createSurveyMutation] = useMutation(createSurvey)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const survey = await createSurveyMutation(values)
      await router.push(Routes.ShowSurveyPage({ surveyId: survey.id }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neuen Survey erstellen" />
      <h1>Neuen Survey erstellen</h1>
      <SurveyForm submitText="Erstellen" onSubmit={handleSubmit} />
    </>
  )
}

const NewSurveyPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <NewSurvey />
      </Suspense>
      <p>
        <Link href={Routes.SurveysPage()}>Alle Surveys</Link>
      </p>
    </LayoutArticle>
  )
}

NewSurveyPage.authenticate = { role: "ADMIN" }

export default NewSurveyPage
