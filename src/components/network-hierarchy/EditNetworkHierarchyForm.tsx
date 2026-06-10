import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useNetworkHierarchyMutations } from "@/src/components/network-hierarchy/useNetworkHierarchyActions"
import { NetworkHierarchySchema } from "@/src/shared/networkHierarchy/schemas"
import { NetworkHierarchyForm } from "./NetworkHierarchyForm"

type Props = {
  networkHierarchy: z.infer<typeof NetworkHierarchySchema> & { id: number }
  projectSlug: string
}

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/network-hierarchy/$networkHierarchyId/edit/",
)

export const EditNetworkHierarchyForm = ({ networkHierarchy, projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { updateRow, deleteRow, listLink, listHref } = useNetworkHierarchyMutations(
    projectSlug,
    search,
  )

  type HandleSubmit = z.infer<ReturnType<typeof NetworkHierarchySchema.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateRow(networkHierarchy.id, values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <NetworkHierarchyForm
        className="grow"
        submitText="Speichern"
        schema={NetworkHierarchySchema.omit({ projectId: true })}
        initialValues={networkHierarchy}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={networkHierarchy.title ?? networkHierarchy.slug}
            onDelete={() => deleteRow(networkHierarchy.id)}
            returnPath={listHref}
          />
        }
      />
      <BackLink {...listLink} text="Zurück zur Übersicht" />
      <SuperAdminLogData data={{ networkHierarchy }} />
    </>
  )
}
