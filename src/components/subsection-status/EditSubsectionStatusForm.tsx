import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsectionStatusMutations } from "@/src/components/subsection-status/useSubsectionStatusActions"
import { SubsectionStatusSchema } from "@/src/shared/subsectionStatus/schemas"
import { SubsectionStatusForm } from "./SubsectionStatusForm"

const EditSubsectionStatusSchema = SubsectionStatusSchema.omit({ projectId: true })

type Props = {
  subsectionStatus: z.infer<typeof SubsectionStatusSchema> & { id: number }
  projectSlug: string
}

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsection-status/$subsectionStatusId/edit/",
)

export const EditSubsectionStatusForm = ({ subsectionStatus, projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { updateRow, deleteRow, listLink, listHref } = useSubsectionStatusMutations(
    projectSlug,
    search,
  )

  type HandleSubmit = z.infer<typeof EditSubsectionStatusSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateRow(subsectionStatus.id, values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsectionStatusForm
        className="grow"
        submitText="Speichern"
        schema={EditSubsectionStatusSchema}
        initialValues={subsectionStatus}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={subsectionStatus.title ?? subsectionStatus.slug}
            onDelete={() => deleteRow(subsectionStatus.id)}
            returnPath={listHref}
          />
        }
        backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      />
      <SuperAdminLogData data={{ subsectionStatus }} />
    </>
  )
}
