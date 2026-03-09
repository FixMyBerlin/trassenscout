"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createSubsubsectionTask from "@/src/server/subsubsectionTask/mutations/createSubsubsectionTask"
import { SubsubsectionTask } from "@/src/server/subsubsectionTask/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsubsectionTaskForm } from "./SubsubsectionTaskForm"

type Props = {
  projectSlug: string
  /** Original form path to preserve in URL for back navigation */
  fromParam?: string
}

export const NewSubsubsectionTaskForm = ({ projectSlug, fromParam }: Props) => {
  const router = useRouter()
  const [createSubsubsectionTaskMutation] = useMutation(createSubsubsectionTask)

  const listPath = `/${projectSlug}/subsubsection-task`
  const returnPath = fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath

  type HandleSubmit = z.infer<ReturnType<typeof SubsubsectionTask.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionTaskMutation({ ...values, projectSlug })
      router.push(returnPath as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <SubsubsectionTaskForm
      className="mt-10"
      submitText="Erstellen"
      schema={SubsubsectionTask.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
