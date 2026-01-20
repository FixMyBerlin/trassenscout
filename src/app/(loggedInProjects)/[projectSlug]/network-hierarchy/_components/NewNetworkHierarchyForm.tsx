"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createNetworkHierarchy from "@/src/server/networkHierarchy/mutations/createNetworkHierarchy"
import { NetworkHierarchySchema } from "@/src/server/networkHierarchy/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { NetworkHierarchyForm } from "./NetworkHierarchyForm"

type Props = {
  projectSlug: string
}

export const NewNetworkHierarchyForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createNetworkHierarchyMutation] = useMutation(createNetworkHierarchy)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createNetworkHierarchyMutation({ ...values, projectSlug })
      router.push(`/${projectSlug}/network-hierarchy` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
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
