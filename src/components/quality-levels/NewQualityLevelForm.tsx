import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useQualityLevelMutations } from "@/src/components/quality-levels/useQualityLevelActions"
import { QualityLevelSchema } from "@/src/shared/qualityLevels/schemas"
import { QualityLevelForm } from "./QualityLevelForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/quality-levels/new/")

export const NewQualityLevelForm = ({ projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { createRow } = useQualityLevelMutations(projectSlug, search)

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
      schema={QualityLevelSchema.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
