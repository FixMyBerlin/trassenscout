"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import updateSubsectionStatus from "@/src/server/subsectionStatus/mutations/updateSubsectionStatus"
import getSubsectionStatus from "@/src/server/subsectionStatus/queries/getSubsectionStatus"
import { SubsectionStatus } from "@/src/server/subsectionStatus/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { SubsectionStatusForm } from "./SubsectionStatusForm"

type Props = {
  subsectionStatus: PromiseReturnType<typeof getSubsectionStatus>
  projectSlug: string
}

export const EditSubsectionStatusForm = ({ subsectionStatus, projectSlug }: Props) => {
  const router = useRouter()
  const [updateSubsectionStatusMutation] = useMutation(updateSubsectionStatus)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateSubsectionStatusMutation({
        ...values,
        id: subsectionStatus.id,
        projectSlug,
      })
      router.push(`/${projectSlug}/subsection-status` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsectionStatusForm
        className="grow"
        submitText="Speichern"
        schema={SubsectionStatus}
        initialValues={subsectionStatus}
        onSubmit={handleSubmit}
      />
      <p className="mt-5">
        <Link href={`/${projectSlug}/subsection-status` as Route}>Zurück zur Übersicht</Link>
      </p>
      <SuperAdminLogData data={{ subsectionStatus }} />
    </>
  )
}
