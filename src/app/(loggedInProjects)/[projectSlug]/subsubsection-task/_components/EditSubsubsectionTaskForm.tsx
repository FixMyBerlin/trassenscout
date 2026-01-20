"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import updateSubsubsectionTask from "@/src/server/subsubsectionTask/mutations/updateSubsubsectionTask"
import getSubsubsectionTask from "@/src/server/subsubsectionTask/queries/getSubsubsectionTask"
import { SubsubsectionTask } from "@/src/server/subsubsectionTask/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { SubsubsectionTaskForm } from "./SubsubsectionTaskForm"

type Props = {
  subsubsectionTask: PromiseReturnType<typeof getSubsubsectionTask>
  projectSlug: string
}

export const EditSubsubsectionTaskForm = ({ subsubsectionTask, projectSlug }: Props) => {
  const router = useRouter()
  const [updateSubsubsectionTaskMutation] = useMutation(updateSubsubsectionTask)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateSubsubsectionTaskMutation({
        ...values,
        id: subsubsectionTask.id,
        projectSlug,
      })
      router.push(`/${projectSlug}/subsubsection-task` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionTaskForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionTask}
        initialValues={subsubsectionTask}
        onSubmit={handleSubmit}
      />
      <SuperAdminLogData data={{ subsubsectionTask }} />
    </>
  )
}
