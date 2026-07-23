import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useSubsubsectionSpecialMutations,
  useSubsubsectionSpecialRouteLinks,
} from "@/src/components/subsubsection-special/useSubsubsectionSpecialActions"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"
import { SubsubsectionSpecial } from "@/src/shared/subsubsectionSpecial/schemas"
import { SubsubsectionSpecialForm } from "./SubsubsectionSpecialForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-special/new/")

export const NewSubsubsectionSpecialForm = ({ projectSlug }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { createRow } = useSubsubsectionSpecialMutations(projectSlug, search)
  const { listLink } = useSubsubsectionSpecialRouteLinks(projectSlug, search)

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
      backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      schema={SubsubsectionSpecial.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
