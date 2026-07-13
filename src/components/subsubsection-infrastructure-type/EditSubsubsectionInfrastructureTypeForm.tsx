import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsubsectionInfrastructureTypeMutations } from "@/src/components/subsubsection-infrastructure-type/useSubsubsectionInfrastructureTypeActions"
import { SubsubsectionInfrastructureType } from "@/src/shared/subsubsectionInfrastructureType/schemas"
import { SubsubsectionInfrastructureTypeForm } from "./SubsubsectionInfrastructureTypeForm"

type Props = {
  subsubsectionInfrastructureType: z.infer<typeof SubsubsectionInfrastructureType> & { id: number }
  projectSlug: string
}

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-infrastructure-type/$subsubsectionInfrastructureTypeId/edit/",
)

export const EditSubsubsectionInfrastructureTypeForm = ({
  subsubsectionInfrastructureType,
  projectSlug,
}: Props) => {
  const search = routeApi.useSearch()
  const { updateRow, deleteRow, listLink, listHref } = useSubsubsectionInfrastructureTypeMutations(
    projectSlug,
    search,
  )

  type HandleSubmit = z.infer<
    ReturnType<typeof SubsubsectionInfrastructureType.omit<{ projectId: true }>>
  >
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateRow(subsubsectionInfrastructureType.id, values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionInfrastructureTypeForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionInfrastructureType.omit({ projectId: true })}
        initialValues={subsubsectionInfrastructureType}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={
              subsubsectionInfrastructureType.title ?? subsubsectionInfrastructureType.slug
            }
            onDelete={() => deleteRow(subsubsectionInfrastructureType.id)}
            returnPath={listHref}
          />
        }
      />
      <BackLink {...listLink} text="Zurück zur Übersicht" />
      <SuperAdminLogData data={{ subsubsectionInfrastructureType }} />
    </>
  )
}
