import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useQualityLevelMutations } from "@/src/components/quality-levels/useQualityLevelActions"
import { QualityLevelSchema } from "@/src/shared/qualityLevels/schemas"
import { QualityLevelForm } from "./QualityLevelForm"

type Props = {
  qualityLevel: z.infer<typeof QualityLevelSchema> & { id: number }
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/quality-levels/$qualityLevelId/edit/")

export const EditQualityLevelForm = ({ qualityLevel, projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { updateRow, deleteRow, listLink, listHref } = useQualityLevelMutations(projectSlug, search)

  type HandleSubmit = z.infer<ReturnType<typeof QualityLevelSchema.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateRow(qualityLevel.id, values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <QualityLevelForm
        className="grow"
        submitText="Speichern"
        schema={QualityLevelSchema.omit({ projectId: true })}
        initialValues={qualityLevel}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={qualityLevel.title ?? qualityLevel.slug}
            onDelete={() => deleteRow(qualityLevel.id)}
            returnPath={listHref}
          />
        }
        backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      />
      <SuperAdminLogData data={{ qualityLevel }} />
    </>
  )
}
