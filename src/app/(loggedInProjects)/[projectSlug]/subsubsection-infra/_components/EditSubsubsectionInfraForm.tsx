"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteSubsubsectionInfra from "@/src/server/subsubsectionInfra/mutations/deleteSubsubsectionInfra"
import updateSubsubsectionInfra from "@/src/server/subsubsectionInfra/mutations/updateSubsubsectionInfra"
import getSubsubsectionInfra from "@/src/server/subsubsectionInfra/queries/getSubsubsectionInfra"
import { SubsubsectionInfra } from "@/src/server/subsubsectionInfra/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsubsectionInfraForm } from "./SubsubsectionInfraForm"

type Props = {
  subsubsectionInfra: PromiseReturnType<typeof getSubsubsectionInfra>
  projectSlug: string
  /** Original form path to preserve in URL for back navigation */
  fromParam?: string
}

export const EditSubsubsectionInfraForm = ({
  subsubsectionInfra,
  projectSlug,
  fromParam,
}: Props) => {
  const router = useRouter()
  const [updateSubsubsectionInfraMutation] = useMutation(updateSubsubsectionInfra)
  const [deleteSubsubsectionInfraMutation] = useMutation(deleteSubsubsectionInfra)

  const listPath = `/${projectSlug}/subsubsection-infra`
  const returnPath = (
    fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath
  ) as Route

  type HandleSubmit = z.infer<typeof SubsubsectionInfra>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateSubsubsectionInfraMutation({
        ...values,
        id: subsubsectionInfra.id,
        projectSlug,
      })
      router.push(returnPath)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionInfraForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionInfra}
        initialValues={subsubsectionInfra}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={subsubsectionInfra.title}
            onDelete={() =>
              deleteSubsubsectionInfraMutation({ id: subsubsectionInfra.id, projectSlug })
            }
            returnPath={returnPath}
          />
        }
      />

      <BackLink href={returnPath} text="Zurück zu den Führungsformen" />

      <SuperAdminLogData data={{ subsubsectionInfra }} />
    </>
  )
}
