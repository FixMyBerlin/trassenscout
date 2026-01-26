"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { DeleteAndBackLinkFooter } from "@/src/core/components/forms/DeleteAndBackLinkFooter"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteSubsubsectionStatus from "@/src/server/subsubsectionStatus/mutations/deleteSubsubsectionStatus"
import updateSubsubsectionStatus from "@/src/server/subsubsectionStatus/mutations/updateSubsubsectionStatus"
import getSubsubsectionStatus from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatus"
import { SubsubsectionStatus } from "@/src/server/subsubsectionStatus/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { SubsubsectionStatusForm } from "./SubsubsectionStatusForm"

type Props = {
  subsubsectionStatus: PromiseReturnType<typeof getSubsubsectionStatus>
  projectSlug: string
}

export const EditSubsubsectionStatusForm = ({ subsubsectionStatus, projectSlug }: Props) => {
  const router = useRouter()
  const [updateSubsubsectionStatusMutation] = useMutation(updateSubsubsectionStatus)
  const [deleteSubsubsectionStatusMutation] = useMutation(deleteSubsubsectionStatus)

  const returnPath = `/${projectSlug}/subsubsection-status` as Route

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateSubsubsectionStatusMutation({
        ...values,
        id: subsubsectionStatus.id,
        projectSlug,
      })
      router.push(`/${projectSlug}/subsubsection-status` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionStatusForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionStatus}
        initialValues={subsubsectionStatus}
        onSubmit={handleSubmit}
      />

      <DeleteAndBackLinkFooter
        id={subsubsectionStatus.id}
        deleteAction={{
          mutate: () =>
            deleteSubsubsectionStatusMutation({ id: subsubsectionStatus.id, projectSlug }),
        }}
        fieldName="Phase"
        backHref={returnPath}
        backText="Zurück zu den Phasen"
      />

      <SuperAdminLogData data={{ subsubsectionStatus }} />
    </>
  )
}
