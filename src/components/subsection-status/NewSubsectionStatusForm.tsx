import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsectionStatusMutations } from "@/src/components/subsection-status/useSubsectionStatusActions"
import { SubsectionStatusSchema } from "@/src/shared/subsectionStatus/schemas"
import { SubsectionStatusForm } from "./SubsectionStatusForm"

const CreateSubsectionStatusSchema = SubsectionStatusSchema.omit({ projectId: true })

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsection-status/new/")

export const NewSubsectionStatusForm = ({ projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { createRow } = useSubsectionStatusMutations(projectSlug, search)

  type HandleSubmit = z.infer<typeof CreateSubsectionStatusSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createRow(values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsectionStatusForm
      submitText="Erstellen"
      schema={CreateSubsectionStatusSchema}
      onSubmit={handleSubmit}
    />
  )
}
