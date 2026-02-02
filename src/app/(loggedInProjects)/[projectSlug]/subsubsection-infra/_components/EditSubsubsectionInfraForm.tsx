"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteSubsubsectionInfra from "@/src/server/subsubsectionInfra/mutations/deleteSubsubsectionInfra"
import updateSubsubsectionInfra from "@/src/server/subsubsectionInfra/mutations/updateSubsubsectionInfra"
import getSubsubsectionInfra from "@/src/server/subsubsectionInfra/queries/getSubsubsectionInfra"
import { SubsubsectionInfra } from "@/src/server/subsubsectionInfra/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { SubsubsectionInfraForm } from "./SubsubsectionInfraForm"

type Props = {
  subsubsectionInfra: PromiseReturnType<typeof getSubsubsectionInfra>
  projectSlug: string
}

export const EditSubsubsectionInfraForm = ({ subsubsectionInfra, projectSlug }: Props) => {
  const router = useRouter()
  const [updateSubsubsectionInfraMutation] = useMutation(updateSubsubsectionInfra)
  const [deleteSubsubsectionInfraMutation] = useMutation(deleteSubsubsectionInfra)

  const returnPath = `/${projectSlug}/subsubsection-infra` as Route

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateSubsubsectionInfraMutation({
        ...values,
        id: subsubsectionInfra.id,
        projectSlug,
      })
      router.push(`/${projectSlug}/subsubsection-infra` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
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
