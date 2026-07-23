import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsubsectionInfraMutations } from "@/src/components/subsubsection-infra/useSubsubsectionInfraActions"
import { SubsubsectionInfra } from "@/src/shared/subsubsectionInfra/schemas"
import { SubsubsectionInfraForm } from "./SubsubsectionInfraForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-infra/new/")

export const NewSubsubsectionInfraForm = ({ projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { createRow } = useSubsubsectionInfraMutations(projectSlug, search)

  type HandleSubmit = z.infer<ReturnType<typeof SubsubsectionInfra.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createRow(values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsubsectionInfraForm
      submitText="Erstellen"
      schema={SubsubsectionInfra.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
