import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useQualityLevelMutations,
  useQualityLevelRouteLinks,
} from "@/src/components/quality-levels/useQualityLevelActions"
import { QualityLevelSchema } from "@/src/shared/qualityLevels/schemas"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"
import { QualityLevelForm } from "./QualityLevelForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/quality-levels/new/")

export const NewQualityLevelForm = ({ projectSlug }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { createRow } = useQualityLevelMutations(projectSlug, search)
  const { listLink } = useQualityLevelRouteLinks(projectSlug, search)

  type HandleSubmit = z.infer<ReturnType<typeof QualityLevelSchema.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createRow(values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <QualityLevelForm
      submitText="Erstellen"
      backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      schema={QualityLevelSchema.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
