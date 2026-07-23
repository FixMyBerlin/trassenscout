import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsubsectionTaskMutations } from "@/src/components/subsubsection-task/useSubsubsectionTaskActions"
import { SubsubsectionTask } from "@/src/shared/subsubsectionTask/schemas"
import { SubsubsectionTaskForm } from "./SubsubsectionTaskForm"

type Props = {
  subsubsectionTask: z.infer<typeof SubsubsectionTask> & { id: number }
  projectSlug: string
}

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-task/$subsubsectionTaskId/edit/",
)

export const EditSubsubsectionTaskForm = ({ subsubsectionTask, projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { updateRow, deleteRow, listLink, listHref } = useSubsubsectionTaskMutations(
    projectSlug,
    search,
  )

  type HandleSubmit = z.infer<ReturnType<typeof SubsubsectionTask.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateRow(subsubsectionTask.id, values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionTaskForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionTask.omit({ projectId: true })}
        initialValues={subsubsectionTask}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={subsubsectionTask.title ?? subsubsectionTask.slug}
            onDelete={() => deleteRow(subsubsectionTask.id)}
            returnPath={listHref}
          />
        }
        backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      />
      <SuperAdminLogData data={{ subsubsectionTask }} />
    </>
  )
}
