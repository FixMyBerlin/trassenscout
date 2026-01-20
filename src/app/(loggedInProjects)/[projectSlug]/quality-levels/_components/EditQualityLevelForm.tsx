"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import updateQualityLevel from "@/src/server/qualityLevels/mutations/updateQualityLevel"
import getQualityLevel from "@/src/server/qualityLevels/queries/getQualityLevel"
import { QualityLevelSchema } from "@/src/server/qualityLevels/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { QualityLevelForm } from "./QualityLevelForm"

type Props = {
  qualityLevel: PromiseReturnType<typeof getQualityLevel>
  projectSlug: string
}

export const EditQualityLevelForm = ({ qualityLevel, projectSlug }: Props) => {
  const router = useRouter()
  const [updateQualityLevelMutation] = useMutation(updateQualityLevel)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateQualityLevelMutation({
        ...values,
        id: qualityLevel.id,
        projectSlug,
      })
      router.push(`/${projectSlug}/quality-levels` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <QualityLevelForm
        className="grow"
        submitText="Speichern"
        schema={QualityLevelSchema}
        initialValues={qualityLevel}
        onSubmit={handleSubmit}
      />
      <SuperAdminLogData data={{ qualityLevel }} />
    </>
  )
}
