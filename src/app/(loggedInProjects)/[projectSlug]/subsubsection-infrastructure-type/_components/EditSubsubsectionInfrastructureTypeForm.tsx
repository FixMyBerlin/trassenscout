"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { DeleteAndBackLinkFooter } from "@/src/core/components/forms/DeleteAndBackLinkFooter"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/mutations/deleteSubsubsectionInfrastructureType"
import updateSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/mutations/updateSubsubsectionInfrastructureType"
import getSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureType"
import { SubsubsectionInfrastructureType } from "@/src/server/subsubsectionInfrastructureType/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsubsectionInfrastructureTypeForm } from "./SubsubsectionInfrastructureTypeForm"

type Props = {
  subsubsectionInfrastructureType: PromiseReturnType<typeof getSubsubsectionInfrastructureType>
  projectSlug: string
}

export const EditSubsubsectionInfrastructureTypeForm = ({
  subsubsectionInfrastructureType,
  projectSlug,
}: Props) => {
  const router = useRouter()
  const [updateSubsubsectionInfrastructureTypeMutation] = useMutation(
    updateSubsubsectionInfrastructureType,
  )
  const [deleteSubsubsectionInfrastructureTypeMutation] = useMutation(
    deleteSubsubsectionInfrastructureType,
  )

  const returnPath = `/${projectSlug}/subsubsection-infrastructure-type` as Route

  type HandleSubmit = Omit<z.infer<typeof SubsubsectionInfrastructureType>, "projectId">
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateSubsubsectionInfrastructureTypeMutation({
        ...values,
        id: subsubsectionInfrastructureType.id,
        projectSlug,
      })
      router.push(`/${projectSlug}/subsubsection-infrastructure-type` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionInfrastructureTypeForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionInfrastructureType}
        initialValues={subsubsectionInfrastructureType}
        onSubmit={handleSubmit}
      />

      <DeleteAndBackLinkFooter
        id={subsubsectionInfrastructureType.id}
        deleteAction={{
          mutate: () =>
            deleteSubsubsectionInfrastructureTypeMutation({
              id: subsubsectionInfrastructureType.id,
              projectSlug,
            }),
        }}
        fieldName="Fördergegenstand"
        backHref={returnPath}
        backText="Zurück zu den Fördergegenständen"
      />

      <SuperAdminLogData data={{ subsubsectionInfrastructureType }} />
    </>
  )
}
