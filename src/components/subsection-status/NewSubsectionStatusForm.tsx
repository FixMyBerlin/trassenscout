import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useSubsectionStatusMutations,
  useSubsectionStatusRouteLinks,
} from "@/src/components/subsection-status/useSubsectionStatusActions"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"
import { SubsectionStatusSchema } from "@/src/shared/subsectionStatus/schemas"
import { SubsectionStatusForm } from "./SubsectionStatusForm"

const CreateSubsectionStatusSchema = SubsectionStatusSchema.omit({ projectId: true })

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsection-status/new/")

export const NewSubsectionStatusForm = ({ projectSlug }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { createRow } = useSubsectionStatusMutations(projectSlug, search)
  const { listLink } = useSubsectionStatusRouteLinks(projectSlug, search)

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
      backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      schema={CreateSubsectionStatusSchema}
      onSubmit={handleSubmit}
    />
  )
}
