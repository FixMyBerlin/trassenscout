"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createOperator from "@/src/server/operators/mutations/createOperator"
import getOperatorMaxOrder from "@/src/server/operators/queries/getOperatorMaxOrder"
import { OperatorSchema } from "@/src/server/operators/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { OperatorForm } from "./OperatorForm"

type Props = {
  projectSlug: string
}

export const NewOperatorForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createOperatorMutation] = useMutation(createOperator)
  const [maxOrderOperators] = useQuery(getOperatorMaxOrder, projectSlug)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createOperatorMutation({ ...values, projectSlug })
      router.push(`/${projectSlug}/operators` as Route)
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
