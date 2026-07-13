import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsubsectionStatusMutations } from "@/src/components/subsubsection-status/useSubsubsectionStatusActions"
import { SubsubsectionStatusSchema } from "@/src/shared/subsubsectionStatus/schemas"
import { SubsubsectionStatusForm } from "./SubsubsectionStatusForm"

const CreateSubsubsectionStatusSchema = SubsubsectionStatusSchema.omit({ projectId: true })

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-status/new/")

export const NewSubsubsectionStatusForm = ({ projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { createRow } = useSubsubsectionStatusMutations(projectSlug, search)

  type HandleSubmit = z.infer<typeof CreateSubsubsectionStatusSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createRow(values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsubsectionStatusForm
      className="mt-10"
      submitText="Erstellen"
      schema={CreateSubsubsectionStatusSchema}
      onSubmit={handleSubmit}
    />
  )
}
