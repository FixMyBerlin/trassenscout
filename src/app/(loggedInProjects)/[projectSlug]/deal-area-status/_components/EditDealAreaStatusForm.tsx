"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteDealAreaStatus from "@/src/server/dealAreaStatuses/mutations/deleteDealAreaStatus"
import updateDealAreaStatus from "@/src/server/dealAreaStatuses/mutations/updateDealAreaStatus"
import getDealAreaStatus from "@/src/server/dealAreaStatuses/queries/getDealAreaStatus"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { DealAreaStatusForm, DealAreaStatusFormSchema } from "./DealAreaStatusForm"

type Props = {
  dealAreaStatus: PromiseReturnType<typeof getDealAreaStatus>
  projectSlug: string
  fromParam?: string
}

export const EditDealAreaStatusForm = ({ dealAreaStatus, projectSlug, fromParam }: Props) => {
  const router = useRouter()
  const [updateDealAreaStatusMutation] = useMutation(updateDealAreaStatus)
  const [deleteDealAreaStatusMutation] = useMutation(deleteDealAreaStatus)

  const listPath = `/${projectSlug}/deal-area-status`
  const returnPath = (
    fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath
  ) as Route

  type HandleSubmit = z.infer<typeof DealAreaStatusFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateDealAreaStatusMutation({
        ...values,
        id: dealAreaStatus.id,
        projectId: dealAreaStatus.projectId,
        style: Number(values.style) as 1 | 2 | 3,
        projectSlug,
      })
      router.push(returnPath)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <DealAreaStatusForm
        className="grow"
        submitText="Speichern"
        schema={DealAreaStatusFormSchema}
        initialValues={{
          slug: dealAreaStatus.slug,
          title: dealAreaStatus.title,
          style: String(dealAreaStatus.style) as "1" | "2" | "3",
        }}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={dealAreaStatus.title}
            onDelete={() => deleteDealAreaStatusMutation({ id: dealAreaStatus.id, projectSlug })}
            returnPath={returnPath}
          />
        }
      />

      <BackLink href={returnPath} text="Zurück zu den Status" />

      <SuperAdminLogData data={{ dealAreaStatus }} />
    </>
  )
}
