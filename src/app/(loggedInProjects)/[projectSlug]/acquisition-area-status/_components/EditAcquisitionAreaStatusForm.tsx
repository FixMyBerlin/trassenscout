"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteAcquisitionAreaStatus from "@/src/server/acquisitionAreaStatuses/mutations/deleteAcquisitionAreaStatus"
import updateAcquisitionAreaStatus from "@/src/server/acquisitionAreaStatuses/mutations/updateAcquisitionAreaStatus"
import getAcquisitionAreaStatus from "@/src/server/acquisitionAreaStatuses/queries/getAcquisitionAreaStatus"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import {
  AcquisitionAreaStatusForm,
  AcquisitionAreaStatusFormSchema,
} from "./AcquisitionAreaStatusForm"

type Props = {
  acquisitionAreaStatus: PromiseReturnType<typeof getAcquisitionAreaStatus>
  projectSlug: string
  fromParam?: string
}

export const EditAcquisitionAreaStatusForm = ({
  acquisitionAreaStatus,
  projectSlug,
  fromParam,
}: Props) => {
  const router = useRouter()
  const [updateAcquisitionAreaStatusMutation] = useMutation(updateAcquisitionAreaStatus)
  const [deleteAcquisitionAreaStatusMutation] = useMutation(deleteAcquisitionAreaStatus)

  const listPath = `/${projectSlug}/acquisition-area-status`
  const returnPath = (
    fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath
  ) as Route

  type HandleSubmit = z.infer<typeof AcquisitionAreaStatusFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateAcquisitionAreaStatusMutation({
        ...values,
        id: acquisitionAreaStatus.id,
        projectId: acquisitionAreaStatus.projectId,
        style: Number(values.style) as 1 | 2 | 3,
        projectSlug,
      })
      router.push(returnPath)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <AcquisitionAreaStatusForm
        className="grow"
        submitText="Speichern"
        schema={AcquisitionAreaStatusFormSchema}
        initialValues={{
          slug: acquisitionAreaStatus.slug,
          title: acquisitionAreaStatus.title,
          style: String(acquisitionAreaStatus.style) as "1" | "2" | "3",
        }}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={acquisitionAreaStatus.title}
            onDelete={() =>
              deleteAcquisitionAreaStatusMutation({ id: acquisitionAreaStatus.id, projectSlug })
            }
            returnPath={returnPath}
          />
        }
      />

      <BackLink href={returnPath} text="Zurück zu den Status" />

      <SuperAdminLogData data={{ acquisitionAreaStatus }} />
    </>
  )
}
