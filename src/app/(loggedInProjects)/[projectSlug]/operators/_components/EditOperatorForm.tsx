"use client"

import { OperatorForm } from "@/src/app/(loggedInProjects)/[projectSlug]/operators/_components/OperatorForm"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteOperator from "@/src/server/operators/mutations/deleteOperator"
import updateOperator from "@/src/server/operators/mutations/updateOperator"
import getOperator from "@/src/server/operators/queries/getOperator"
import { OperatorSchema } from "@/src/server/operators/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"

type Props = {
  operator: PromiseReturnType<typeof getOperator>
  projectSlug: string
  /** Original form path to preserve in URL for back navigation */
  fromParam?: string
}

export const EditOperatorForm = ({ operator, projectSlug, fromParam }: Props) => {
  const router = useRouter()
  const [updateOperatorMutation] = useMutation(updateOperator)
  const [deleteOperatorMutation] = useMutation(deleteOperator)

  const listPath = `/${projectSlug}/operators`
  const returnPath = (
    fromParam ? `${listPath}?from=${encodeURIComponent(fromParam)}` : listPath
  ) as Route

  type HandleSubmit = z.infer<typeof OperatorSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateOperatorMutation({
        ...values,
        id: operator.id,
        projectSlug,
      })
      router.push(returnPath)
      router.refresh()
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
        return improveErrorMessage(error, ["slug"])
      }
    }
  }

  return (
    <>
      <OperatorForm
        className="grow"
        submitText="Speichern"
        schema={OperatorSchema}
        initialValues={operator}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={operator.title}
            onDelete={() => deleteOperatorMutation({ id: operator.id, projectSlug })}
            returnPath={returnPath}
          />
        }
      />

      <BackLink href={returnPath} text="Zurück zu den Baulastträgern" />

      <SuperAdminLogData data={{ operator }} />
    </>
  )
}
