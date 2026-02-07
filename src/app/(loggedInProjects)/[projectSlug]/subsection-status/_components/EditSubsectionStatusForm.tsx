"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteSubsectionStatus from "@/src/server/subsectionStatus/mutations/deleteSubsectionStatus"
import updateSubsectionStatus from "@/src/server/subsectionStatus/mutations/updateSubsectionStatus"
import getSubsectionStatus from "@/src/server/subsectionStatus/queries/getSubsectionStatus"
import { SubsectionStatus } from "@/src/server/subsectionStatus/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsectionStatusForm } from "./SubsectionStatusForm"

type Props = {
  subsectionStatus: PromiseReturnType<typeof getSubsectionStatus>
  projectSlug: string
}

export const EditSubsectionStatusForm = ({ subsectionStatus, projectSlug }: Props) => {
  const router = useRouter()
  const [updateSubsectionStatusMutation] = useMutation(updateSubsectionStatus)
  const [deleteSubsectionStatusMutation] = useMutation(deleteSubsectionStatus)

  const returnPath = `/${projectSlug}/subsection-status` as Route

  type HandleSubmit = z.infer<typeof SubsectionStatus>
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
        actionBarRight={
          <DeleteActionBar
            itemTitle={subsectionStatus.title}
            onDelete={() =>
              deleteSubsectionStatusMutation({ id: subsectionStatus.id, projectSlug })
            }
            returnPath={returnPath}
          />
        }
      />

      <BackLink href={returnPath} text="Zurück zu den Status-Einträgen" />

      <SuperAdminLogData data={{ subsectionStatus }} />
    </>
  )
}
