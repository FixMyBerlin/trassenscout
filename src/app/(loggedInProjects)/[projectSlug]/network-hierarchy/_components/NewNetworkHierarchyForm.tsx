"use client"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createNetworkHierarchy from "@/src/server/networkHierarchy/mutations/createNetworkHierarchy"
import { NetworkHierarchySchema } from "@/src/server/networkHierarchy/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { NetworkHierarchyForm } from "./NetworkHierarchyForm"

type Props = {
  projectSlug: string
  /** Original form path to preserve in URL for back navigation */
  fromParam?: string
}

export const NewNetworkHierarchyForm = ({ projectSlug, fromParam }: Props) => {
  const router = useRouter()
  const [createNetworkHierarchyMutation] = useMutation(createNetworkHierarchy)

  const listPath = `/${projectSlug}/network-hierarchy`
  const returnPath = fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath

  type HandleSubmit = z.infer<ReturnType<typeof NetworkHierarchySchema.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createNetworkHierarchyMutation({ ...values, projectSlug })
      router.push(returnPath as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, ["slug"])
    }
  }

  return (
    <NetworkHierarchyForm
      className="mt-10"
      submitText="Erstellen"
      schema={NetworkHierarchySchema.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
