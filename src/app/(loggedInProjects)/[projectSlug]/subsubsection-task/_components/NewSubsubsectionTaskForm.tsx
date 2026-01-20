"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createSubsubsectionTask from "@/src/server/subsubsectionTask/mutations/createSubsubsectionTask"
import { SubsubsectionTask } from "@/src/server/subsubsectionTask/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { SubsubsectionTaskForm } from "./SubsubsectionTaskForm"

type Props = {
  projectSlug: string
}

export const NewSubsubsectionTaskForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createSubsubsectionTaskMutation] = useMutation(createSubsubsectionTask)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionTaskMutation({ ...values, projectSlug })
      router.push(`/${projectSlug}/subsubsection-task` as Route)
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
