"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createDealAreaStatus from "@/src/server/dealAreaStatuses/mutations/createDealAreaStatus"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { DealAreaStatusForm, DealAreaStatusFormSchema } from "./DealAreaStatusForm"

type Props = {
  projectSlug: string
  fromParam?: string
}

export const NewDealAreaStatusForm = ({ projectSlug, fromParam }: Props) => {
  const router = useRouter()
  const [createDealAreaStatusMutation] = useMutation(createDealAreaStatus)

  const listPath = `/${projectSlug}/deal-area-status`
  const returnPath = fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath

  type HandleSubmit = z.infer<typeof DealAreaStatusFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createDealAreaStatusMutation({
        ...values,
        style: Number(values.style) as 1 | 2 | 3,
        projectSlug,
      })
      router.push(returnPath as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <DealAreaStatusForm
      className="mt-10"
      submitText="Erstellen"
      schema={DealAreaStatusFormSchema}
      onSubmit={handleSubmit}
    />
  )
}
