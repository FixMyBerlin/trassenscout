"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteNetworkHierarchy from "@/src/server/networkHierarchy/mutations/deleteNetworkHierarchy"
import updateNetworkHierarchy from "@/src/server/networkHierarchy/mutations/updateNetworkHierarchy"
import getNetworkHierarchy from "@/src/server/networkHierarchy/queries/getNetworkHierarchy"
import { NetworkHierarchySchema } from "@/src/server/networkHierarchy/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { NetworkHierarchyForm } from "./NetworkHierarchyForm"

type Props = {
  networkHierarchy: PromiseReturnType<typeof getNetworkHierarchy>
  projectSlug: string
  /** Original form path to preserve in URL for back navigation */
  fromParam?: string
}

export const EditNetworkHierarchyForm = ({ networkHierarchy, projectSlug, fromParam }: Props) => {
  const router = useRouter()
  const [updateNetworkHierarchyMutation] = useMutation(updateNetworkHierarchy)
  const [deleteNetworkHierarchyMutation] = useMutation(deleteNetworkHierarchy)

  const listPath = `/${projectSlug}/network-hierarchy`
  const returnPath = (
    fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath
  ) as Route

  type HandleSubmit = z.infer<typeof NetworkHierarchySchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateNetworkHierarchyMutation({
        ...values,
        id: networkHierarchy.id,
        projectSlug,
      })
      router.push(returnPath)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, ["slug"])
    }
  }

  return (
    <>
      <NetworkHierarchyForm
        className="grow"
        submitText="Speichern"
        schema={NetworkHierarchySchema}
        initialValues={networkHierarchy}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={networkHierarchy.title}
            onDelete={() =>
              deleteNetworkHierarchyMutation({ id: networkHierarchy.id, projectSlug })
            }
            returnPath={returnPath}
          />
        }
      />

      <BackLink href={returnPath} text="Zurück zu den Netzstufen" />

      <SuperAdminLogData data={{ networkHierarchy }} />
    </>
  )
}
