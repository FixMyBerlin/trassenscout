import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useNetworkHierarchyMutations,
  useNetworkHierarchyRouteLinks,
} from "@/src/components/network-hierarchy/useNetworkHierarchyActions"
import { NetworkHierarchySchema } from "@/src/shared/networkHierarchy/schemas"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"
import { NetworkHierarchyForm } from "./NetworkHierarchyForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/network-hierarchy/new/")

export const NewNetworkHierarchyForm = ({ projectSlug }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { createRow } = useNetworkHierarchyMutations(projectSlug, search)
  const { listLink } = useNetworkHierarchyRouteLinks(projectSlug, search)

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
      backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      schema={NetworkHierarchySchema.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
