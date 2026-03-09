"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createSubsubsectionStatus from "@/src/server/subsubsectionStatus/mutations/createSubsubsectionStatus"
import { SubsubsectionStatus } from "@/src/server/subsubsectionStatus/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsubsectionStatusForm } from "./SubsubsectionStatusForm"

type Props = {
  projectSlug: string
  /** Original form path to preserve in URL for back navigation */
  fromParam?: string
}

export const NewSubsubsectionStatusForm = ({ projectSlug, fromParam }: Props) => {
  const router = useRouter()
  const [createSubsubsectionStatusMutation] = useMutation(createSubsubsectionStatus)

  const listPath = `/${projectSlug}/subsubsection-status`
  const returnPath = fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath

  type HandleSubmit = z.infer<ReturnType<typeof SubsubsectionStatus.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionStatusMutation({ ...values, projectSlug })
      router.push(returnPath as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsubsectionStatusForm
      className="mt-10"
      submitText="Erstellen"
      schema={SubsubsectionStatus.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
