import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsubsectionInfraMutations } from "@/src/components/subsubsection-infra/useSubsubsectionInfraActions"
import { SubsubsectionInfra } from "@/src/shared/subsubsectionInfra/schemas"
import { SubsubsectionInfraForm } from "./SubsubsectionInfraForm"

type Props = {
  subsubsectionInfra: z.infer<typeof SubsubsectionInfra> & { id: number }
  projectSlug: string
}

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-infra/$subsubsectionInfraId/edit/",
)

export const EditSubsubsectionInfraForm = ({ subsubsectionInfra, projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { updateRow, deleteRow, listLink, listHref } = useSubsubsectionInfraMutations(
    projectSlug,
    search,
  )

  type HandleSubmit = z.infer<ReturnType<typeof SubsubsectionInfra.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateRow(subsubsectionInfra.id, values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionInfraForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionInfra.omit({ projectId: true })}
        initialValues={subsubsectionInfra}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={subsubsectionInfra.title ?? subsubsectionInfra.slug}
            onDelete={() => deleteRow(subsubsectionInfra.id)}
            returnPath={listHref}
          />
        }
        backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      />
      <SuperAdminLogData data={{ subsubsectionInfra }} />
    </>
  )
}
