import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsubsectionStatusMutations } from "@/src/components/subsubsection-status/useSubsubsectionStatusActions"
import { SubsubsectionStatusSchema } from "@/src/shared/subsubsectionStatus/schemas"
import { SubsubsectionStatusForm } from "./SubsubsectionStatusForm"

const EditSubsubsectionStatusSchema = SubsubsectionStatusSchema.omit({ projectId: true })

type Props = {
  subsubsectionStatus: z.infer<typeof SubsubsectionStatusSchema> & { id: number }
  projectSlug: string
}

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-status/$subsubsectionStatusId/edit/",
)

export const EditSubsubsectionStatusForm = ({ subsubsectionStatus, projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { updateRow, deleteRow, listLink, listHref } = useSubsubsectionStatusMutations(
    projectSlug,
    search,
  )

  type HandleSubmit = z.infer<typeof EditSubsubsectionStatusSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateRow(subsubsectionStatus.id, values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionStatusForm
        className="grow"
        submitText="Speichern"
        schema={EditSubsubsectionStatusSchema}
        initialValues={subsubsectionStatus}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={subsubsectionStatus.title ?? subsubsectionStatus.slug}
            onDelete={() => deleteRow(subsubsectionStatus.id)}
            returnPath={listHref}
          />
        }
        backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      />
      <SuperAdminLogData data={{ subsubsectionStatus }} />
    </>
  )
}
