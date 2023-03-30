import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { Spinner } from "src/core/components/Spinner"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SurveySessionForm } from "src/survey-sessions/components/SurveySessionForm"
import updateSurveySession from "src/survey-sessions/mutations/updateSurveySession"
import getSurveySession from "src/survey-sessions/queries/getSurveySession"

const EditSurveySession = () => {
  const router = useRouter()
  const surveySessionId = useParam("surveySessionId", "number")
  const [surveySession, { setQueryData }] = useQuery(
    getSurveySession,
    { id: surveySessionId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateSurveySessionMutation] = useMutation(updateSurveySession)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSurveySessionMutation({
        id: surveySession.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.ShowSurveySessionPage({ surveySessionId: updated.id }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`SurveySession ${surveySession.id} bearbeiten`} />

      <h1>SurveySession {surveySession.id} bearbeiten</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(surveySession, null, 2)}</pre>
      </SuperAdminBox>

      <SurveySessionForm
        submitText="Speichern"
        // TODO use a zod schema for form validation
        // 1. Move the schema from mutations/createSurveySession.ts to `SurveySession/schema.ts`
        //   - Name `SurveySessionSchema`
        // 2. Import the zod schema here.
        // 3. Update the mutations/updateSurveySession.ts to
        //   `const UpdateSurveySessionSchema = SurveySessionSchema.merge(z.object({id: z.number(),}))`
        // schema={SurveySessionSchema}
        initialValues={surveySession}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const EditSurveySessionPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <EditSurveySession />
      </Suspense>

      <p>
        <Link href={Routes.SurveySessionsPage()}>Alle SurveySessions</Link>
      </p>
    </LayoutArticle>
  )
}

EditSurveySessionPage.authenticate = true

export default EditSurveySessionPage
