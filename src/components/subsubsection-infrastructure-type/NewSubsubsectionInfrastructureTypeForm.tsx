import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsubsectionInfrastructureTypeMutations } from "@/src/components/subsubsection-infrastructure-type/useSubsubsectionInfrastructureTypeActions"
import { SubsubsectionInfrastructureType } from "@/src/shared/subsubsectionInfrastructureType/schemas"
import { SubsubsectionInfrastructureTypeForm } from "./SubsubsectionInfrastructureTypeForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-infrastructure-type/new/",
)

export const NewSubsubsectionInfrastructureTypeForm = ({ projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { createRow } = useSubsubsectionInfrastructureTypeMutations(projectSlug, search)

  type HandleSubmit = z.infer<
    ReturnType<typeof SubsubsectionInfrastructureType.omit<{ projectId: true }>>
  >
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createRow(values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsubsectionInfrastructureTypeForm
      submitText="Erstellen"
      schema={SubsubsectionInfrastructureType.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
