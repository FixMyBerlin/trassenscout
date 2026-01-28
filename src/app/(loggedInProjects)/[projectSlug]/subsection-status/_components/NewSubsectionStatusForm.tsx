"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createSubsectionStatus from "@/src/server/subsectionStatus/mutations/createSubsectionStatus"
import { SubsectionStatus } from "@/src/server/subsectionStatus/schema"
import { useMutation } from "@blitzjs/rpc"
import { StatusStyleEnum } from "@prisma/client"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { SubsectionStatusForm } from "./SubsectionStatusForm"

type Props = {
  projectSlug: string
}

export const NewSubsectionStatusForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createSubsectionStatusMutation] = useMutation(createSubsectionStatus)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsectionStatusMutation({ ...values, projectSlug })
      router.push(`/${projectSlug}/subsection-status` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsectionStatusForm
      className="mt-10"
      submitText="Erstellen"
      schema={SubsectionStatus.omit({ projectId: true })}
      onSubmit={handleSubmit}
      initialValues={{
        style: StatusStyleEnum.REGULAR,
      }}
    />
  )
}
