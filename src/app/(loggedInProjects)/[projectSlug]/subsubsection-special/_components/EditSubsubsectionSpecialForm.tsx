"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteSubsubsectionSpecial from "@/src/server/subsubsectionSpecial/mutations/deleteSubsubsectionSpecial"
import updateSubsubsectionSpecial from "@/src/server/subsubsectionSpecial/mutations/updateSubsubsectionSpecial"
import getSubsubsectionSpecial from "@/src/server/subsubsectionSpecial/queries/getSubsubsectionSpecial"
import { SubsubsectionSpecial } from "@/src/server/subsubsectionSpecial/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { SubsubsectionSpecialForm } from "./SubsubsectionSpecialForm"

type Props = {
  subsubsectionSpecial: PromiseReturnType<typeof getSubsubsectionSpecial>
  projectSlug: string
}

export const EditSubsubsectionSpecialForm = ({ subsubsectionSpecial, projectSlug }: Props) => {
  const router = useRouter()
  const [updateSubsubsectionSpecialMutation] = useMutation(updateSubsubsectionSpecial)
  const [deleteSubsubsectionSpecialMutation] = useMutation(deleteSubsubsectionSpecial)

  const returnPath = `/${projectSlug}/subsubsection-special` as Route

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateSubsubsectionSpecialMutation({
        ...values,
        id: subsubsectionSpecial.id,
        projectSlug,
      })
      router.push(`/${projectSlug}/subsubsection-special` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionSpecialForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionSpecial}
        initialValues={subsubsectionSpecial}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={subsubsectionSpecial.title}
            onDelete={() =>
              deleteSubsubsectionSpecialMutation({ id: subsubsectionSpecial.id, projectSlug })
            }
            returnPath={returnPath}
          />
        }
      />

      <BackLink href={returnPath} text="Zurück zu den Besonderheiten" />

      <SuperAdminLogData data={{ subsubsectionSpecial }} />
    </>
  )
}
