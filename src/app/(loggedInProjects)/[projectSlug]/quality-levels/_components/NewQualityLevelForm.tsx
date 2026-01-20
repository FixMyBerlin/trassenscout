"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createQualityLevel from "@/src/server/qualityLevels/mutations/createQualityLevel"
import { QualityLevelSchema } from "@/src/server/qualityLevels/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { QualityLevelForm } from "./QualityLevelForm"

type Props = {
  projectSlug: string
}

export const NewQualityLevelForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createQualityLevelMutation] = useMutation(createQualityLevel)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createQualityLevelMutation({ ...values, projectSlug })
      router.push(`/${projectSlug}/quality-levels` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <QualityLevelForm
      className="mt-10"
      submitText="Erstellen"
      schema={QualityLevelSchema.omit({ projectId: true })}
      onSubmit={handleSubmit}
    />
  )
}
