"use client"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createQualityLevel from "@/src/server/qualityLevels/mutations/createQualityLevel"
import { QualityLevelSchema } from "@/src/server/qualityLevels/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { QualityLevelForm } from "./QualityLevelForm"

type Props = {
  projectSlug: string
  /** Original form path to preserve in URL for back navigation */
  fromParam?: string
}

export const NewQualityLevelForm = ({ projectSlug, fromParam }: Props) => {
  const router = useRouter()
  const [createQualityLevelMutation] = useMutation(createQualityLevel)

  const listPath = `/${projectSlug}/quality-levels`
  const returnPath = fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath

  type HandleSubmit = z.infer<ReturnType<typeof QualityLevelSchema.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createQualityLevelMutation({ ...values, projectSlug })
      router.push(returnPath as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, ["slug"])
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
