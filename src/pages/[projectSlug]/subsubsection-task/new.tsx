import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { improveErrorMessage } from "src/core/components/forms/improveErrorMessage"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoNewTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { SubsubsectionTaskForm } from "src/subsubsectionTask/components/SubsubsectionTaskForm"
import createSubsubsectionTask from "src/subsubsectionTask/mutations/createSubsubsectionTask"
import { SubsubsectionTask } from "src/subsubsectionTask/schema"
import { FORM_ERROR } from "src/subsubsections/components/SubsubsectionForm"

const NewSubsubsectionTaskPageWithQuery = () => {
  const router = useRouter()
  const { projectSlug } = useSlugs()
  const [createSubsubsectionTaskMutation] = useMutation(createSubsubsectionTask)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionTaskMutation({ ...values, projectSlug: projectSlug! })
      await router.push(Routes.SubsubsectionTasksPage({ projectSlug: projectSlug! }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Task für Führungen")} />
      <PageHeader title="Task für Führungen hinzufügen" className="mt-12" />

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
