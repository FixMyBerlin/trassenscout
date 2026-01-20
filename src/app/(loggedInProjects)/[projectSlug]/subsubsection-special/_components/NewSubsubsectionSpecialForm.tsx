"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createSubsubsectionSpecial from "@/src/server/subsubsectionSpecial/mutations/createSubsubsectionSpecial"
import { SubsubsectionSpecial } from "@/src/server/subsubsectionSpecial/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { SubsubsectionSpecialForm } from "./SubsubsectionSpecialForm"

type Props = {
  projectSlug: string
}

export const NewSubsubsectionSpecialForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createSubsubsectionSpecialMutation] = useMutation(createSubsubsectionSpecial)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionSpecialMutation({ ...values, projectSlug })
      router.push(`/${projectSlug}/subsubsection-special` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsubsectionSpecialForm
      className="mt-10"
      submitText="Erstellen"
      schema={SubsubsectionSpecial.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
