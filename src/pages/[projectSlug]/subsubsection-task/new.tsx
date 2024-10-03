import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Spinner } from "@/src/core/components/Spinner"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsubsectionTaskForm } from "@/src/pagesComponents/subsubsectionTask/SubsubsectionTaskForm"
import createSubsubsectionTask from "@/src/server/subsubsectionTask/mutations/createSubsubsectionTask"
import { SubsubsectionTask } from "@/src/server/subsubsectionTask/schema"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const NewSubsubsectionTaskPageWithQuery = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createSubsubsectionTaskMutation] = useMutation(createSubsubsectionTask)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionTaskMutation({ ...values, projectSlug })
      await router.push(Routes.SubsubsectionTasksPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Maßnahmentyp")} />
      <PageHeader title="Maßnahmentyp hinzufügen" className="mt-12" />

      <SubsubsectionTaskForm
        className="mt-10"
        submitText="Erstellen"
        schema={SubsubsectionTask.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewSubsubsectionTaskPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewSubsubsectionTaskPageWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

NewSubsubsectionTaskPage.authenticate = true

export default NewSubsubsectionTaskPage
