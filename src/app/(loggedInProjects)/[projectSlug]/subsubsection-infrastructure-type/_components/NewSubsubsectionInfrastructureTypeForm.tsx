"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/mutations/createSubsubsectionInfrastructureType"
import { SubsubsectionInfrastructureType } from "@/src/server/subsubsectionInfrastructureType/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsubsectionInfrastructureTypeForm } from "./SubsubsectionInfrastructureTypeForm"

type Props = {
  projectSlug: string
}

export const NewSubsubsectionInfrastructureTypeForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createSubsubsectionInfrastructureTypeMutation] = useMutation(
    createSubsubsectionInfrastructureType,
  )

  type HandleSubmit = Omit<z.infer<typeof SubsubsectionInfrastructureType>, "projectId">
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionInfrastructureTypeMutation({ ...values, projectSlug })
      router.push(`/${projectSlug}/subsubsection-infrastructure-type` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsubsectionInfrastructureTypeForm
      className="mt-10"
      submitText="Erstellen"
      schema={SubsubsectionInfrastructureType.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
