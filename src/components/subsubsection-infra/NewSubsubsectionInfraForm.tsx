import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useSubsubsectionInfraMutations,
  useSubsubsectionInfraRouteLinks,
} from "@/src/components/subsubsection-infra/useSubsubsectionInfraActions"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"
import { SubsubsectionInfra } from "@/src/shared/subsubsectionInfra/schemas"
import { SubsubsectionInfraForm } from "./SubsubsectionInfraForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-infra/new/")

export const NewSubsubsectionInfraForm = ({ projectSlug }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { createRow } = useSubsubsectionInfraMutations(projectSlug, search)
  const { listLink } = useSubsubsectionInfraRouteLinks(projectSlug, search)

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
      backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      schema={SubsubsectionInfra.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
