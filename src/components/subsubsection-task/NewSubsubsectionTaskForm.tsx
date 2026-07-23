import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useSubsubsectionTaskMutations,
  useSubsubsectionTaskRouteLinks,
} from "@/src/components/subsubsection-task/useSubsubsectionTaskActions"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"
import { SubsubsectionTask } from "@/src/shared/subsubsectionTask/schemas"
import { SubsubsectionTaskForm } from "./SubsubsectionTaskForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-task/new/")

export const NewSubsubsectionTaskForm = ({ projectSlug }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { createRow } = useSubsubsectionTaskMutations(projectSlug, search)
  const { listLink } = useSubsubsectionTaskRouteLinks(projectSlug, search)

  type HandleSubmit = z.infer<ReturnType<typeof SubsubsectionTask.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createRow(values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsubsectionTaskForm
      submitText="Erstellen"
      backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      schema={SubsubsectionTask.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
