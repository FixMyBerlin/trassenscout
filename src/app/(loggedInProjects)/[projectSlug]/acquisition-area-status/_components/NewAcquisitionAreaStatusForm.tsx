"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createAcquisitionAreaStatus from "@/src/server/acquisitionAreaStatuses/mutations/createAcquisitionAreaStatus"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { type AcquisitionAreaStatusStyle } from "../_utils/acquisitionAreaStatusStyles"
import {
  AcquisitionAreaStatusForm,
  AcquisitionAreaStatusFormSchema,
} from "./AcquisitionAreaStatusForm"

type Props = {
  projectSlug: string
  fromParam?: string
}

export const NewAcquisitionAreaStatusForm = ({ projectSlug, fromParam }: Props) => {
  const router = useRouter()
  const [createAcquisitionAreaStatusMutation] = useMutation(createAcquisitionAreaStatus)

  const listPath = `/${projectSlug}/acquisition-area-status`
  const returnPath = fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath

  type HandleSubmit = z.infer<typeof AcquisitionAreaStatusFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createAcquisitionAreaStatusMutation({
        ...values,
        style: Number(values.style) as AcquisitionAreaStatusStyle,
        projectSlug,
      })
      router.push(returnPath as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <AcquisitionAreaStatusForm
      className="mt-10"
      submitText="Erstellen"
      schema={AcquisitionAreaStatusFormSchema}
      onSubmit={handleSubmit}
    />
  )
}
