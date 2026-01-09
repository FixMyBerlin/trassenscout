"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createSubsubsectionStatus from "@/src/server/subsubsectionStatus/mutations/createSubsubsectionStatus"
import { SubsubsectionStatus } from "@/src/server/subsubsectionStatus/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { SubsubsectionStatusForm } from "./SubsubsectionStatusForm"

type Props = {
  projectSlug: string
}

export const NewSubsubsectionStatusForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createSubsubsectionStatusMutation] = useMutation(createSubsubsectionStatus)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionStatusMutation({ ...values, projectSlug })
      router.push(`/${projectSlug}/subsubsection-status` as Route)
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
