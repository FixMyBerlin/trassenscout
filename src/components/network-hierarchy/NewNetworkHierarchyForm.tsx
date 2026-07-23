import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useNetworkHierarchyMutations } from "@/src/components/network-hierarchy/useNetworkHierarchyActions"
import { NetworkHierarchySchema } from "@/src/shared/networkHierarchy/schemas"
import { NetworkHierarchyForm } from "./NetworkHierarchyForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/network-hierarchy/new/")

export const NewNetworkHierarchyForm = ({ projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { createRow } = useNetworkHierarchyMutations(projectSlug, search)

  type HandleSubmit = z.infer<ReturnType<typeof NetworkHierarchySchema.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createRow(values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <NetworkHierarchyForm
      submitText="Erstellen"
      schema={NetworkHierarchySchema.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
