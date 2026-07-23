import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsubsectionSpecialMutations } from "@/src/components/subsubsection-special/useSubsubsectionSpecialActions"
import { SubsubsectionSpecial } from "@/src/shared/subsubsectionSpecial/schemas"
import { SubsubsectionSpecialForm } from "./SubsubsectionSpecialForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-special/new/")

export const NewSubsubsectionSpecialForm = ({ projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { createRow } = useSubsubsectionSpecialMutations(projectSlug, search)

  type HandleSubmit = z.infer<ReturnType<typeof SubsubsectionSpecial.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createRow(values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsubsectionSpecialForm
      submitText="Erstellen"
      schema={SubsubsectionSpecial.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
