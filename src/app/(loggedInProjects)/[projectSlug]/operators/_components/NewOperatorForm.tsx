"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createOperator from "@/src/server/operators/mutations/createOperator"
import getOperatorMaxOrder from "@/src/server/operators/queries/getOperatorMaxOrder"
import { OperatorSchema } from "@/src/server/operators/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { OperatorForm } from "./OperatorForm"

type Props = {
  projectSlug: string
  /** Original form path to preserve in URL for back navigation */
  fromParam?: string
}

export const NewOperatorForm = ({ projectSlug, fromParam }: Props) => {
  const router = useRouter()
  const [createOperatorMutation] = useMutation(createOperator)
  const [maxOrderOperators] = useQuery(getOperatorMaxOrder, projectSlug)

  const listPath = `/${projectSlug}/operators`
  const returnPath = fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath

  type HandleSubmit = z.infer<ReturnType<typeof OperatorSchema.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createOperatorMutation({ ...values, projectSlug })
      router.push(returnPath as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <OperatorForm
      className="mt-10"
      submitText="Erstellen"
      schema={OperatorSchema.omit({ projectId: true })}
      onSubmit={handleSubmit}
      initialValues={{
        order: (maxOrderOperators || 0) + 1,
      }}
    />
  )
}
