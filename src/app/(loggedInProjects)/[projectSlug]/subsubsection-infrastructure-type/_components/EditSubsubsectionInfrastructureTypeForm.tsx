"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
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
  /** Original form path to preserve in URL for back navigation */
  fromParam?: string
}

export const EditSubsubsectionInfrastructureTypeForm = ({
  subsubsectionInfrastructureType,
  projectSlug,
  fromParam,
}: Props) => {
  const router = useRouter()
  const [updateSubsubsectionInfrastructureTypeMutation] = useMutation(
    updateSubsubsectionInfrastructureType,
  )
  const [deleteSubsubsectionInfrastructureTypeMutation] = useMutation(
    deleteSubsubsectionInfrastructureType,
  )

  const listPath = `/${projectSlug}/subsubsection-infrastructure-type`
  const returnPath = (
    fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath
  ) as Route

  type HandleSubmit = Omit<z.infer<typeof SubsubsectionInfrastructureType>, "projectId">
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateSubsubsectionInfrastructureTypeMutation({
        ...values,
        id: subsubsectionInfrastructureType.id,
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
      <SubsubsectionInfrastructureTypeForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionInfrastructureType}
        initialValues={subsubsectionInfrastructureType}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={subsubsectionInfrastructureType.title}
            onDelete={() =>
              deleteSubsubsectionInfrastructureTypeMutation({
                id: subsubsectionInfrastructureType.id,
                projectSlug,
              })
            }
            returnPath={returnPath}
          />
        }
      />

      <BackLink href={returnPath} text="Zurück zu den Gegenständen der Förderung" />

      <SuperAdminLogData data={{ subsubsectionInfrastructureType }} />
    </>
  )
}
