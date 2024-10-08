import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsubsectionTaskForm } from "@/src/pagesComponents/subsubsectionTask/SubsubsectionTaskForm"
import updateSubsubsectionTask from "@/src/server/subsubsectionTask/mutations/updateSubsubsectionTask"
import getSubsubsectionTask from "@/src/server/subsubsectionTask/queries/getSubsubsectionTask"
import { SubsubsectionTask } from "@/src/server/subsubsectionTask/schema"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditSubsubsectionsTaskWithQuery = () => {
  const router = useRouter()
  const subsubsectionTaskId = useParam("subsubsectionTaskId", "number")
  const projectSlug = useProjectSlug()

  const [subsubsectionTask, { setQueryData }] = useQuery(
    getSubsubsectionTask,
    { projectSlug, id: subsubsectionTaskId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateSubsubsectionTaskMutation] = useMutation(updateSubsubsectionTask)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionTaskMutation({
        ...values,
        id: subsubsectionTask.id,
        projectSlug,
      })
      await setQueryData(updated)
      await router.push(Routes.SubsubsectionTasksPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionTaskForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionTask}
        initialValues={subsubsectionTask}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.SubsubsectionTasksPage({ projectSlug })}>Zurück zur Übersicht</Link>
      </p>

      <SuperAdminLogData data={{ subsubsectionTask }} />
    </>
  )
}

const EditSubsubsectionTaskPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Maßnahmentyp")} />
      <PageHeader title="Maßnahmentyp bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditSubsubsectionsTaskWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditSubsubsectionTaskPage.authenticate = true

export default EditSubsubsectionTaskPage
