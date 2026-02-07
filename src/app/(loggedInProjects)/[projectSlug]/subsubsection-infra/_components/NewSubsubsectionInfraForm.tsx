"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createSubsubsectionInfra from "@/src/server/subsubsectionInfra/mutations/createSubsubsectionInfra"
import { SubsubsectionInfra } from "@/src/server/subsubsectionInfra/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsubsectionInfraForm } from "./SubsubsectionInfraForm"

type Props = {
  projectSlug: string
}

export const NewSubsubsectionInfraForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createSubsubsectionInfraMutation] = useMutation(createSubsubsectionInfra)

  type HandleSubmit = z.infer<ReturnType<typeof SubsubsectionInfra.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionInfraMutation({ ...values, projectSlug })
      router.push(`/${projectSlug}/subsubsection-infra` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsubsectionInfraForm
      className="mt-10"
      submitText="Erstellen"
      schema={SubsubsectionInfra.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
