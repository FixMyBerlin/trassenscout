"use client"

import { OperatorForm } from "@/src/app/(loggedInProjects)/[projectSlug]/operators/_components/OperatorForm"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { DeleteAndBackLinkFooter } from "@/src/core/components/forms/DeleteAndBackLinkFooter"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteOperator from "@/src/server/operators/mutations/deleteOperator"
import updateOperator from "@/src/server/operators/mutations/updateOperator"
import getOperator from "@/src/server/operators/queries/getOperator"
import { OperatorSchema } from "@/src/server/operators/schema"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  operator: PromiseReturnType<typeof getOperator>
  projectSlug: string
}

export const EditOperatorForm = ({ operator, projectSlug }: Props) => {
  const router = useRouter()
  const [updateOperatorMutation] = useMutation(updateOperator)
  const [deleteOperatorMutation] = useMutation(deleteOperator)

  const returnPath = `/${projectSlug}/operators` as Route

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateOperatorMutation({
        ...values,
        id: operator.id,
        projectSlug,
      })
      router.push(`/${projectSlug}/operators` as Route)
      router.refresh()
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
        return improveErrorMessage(error, FORM_ERROR, ["slug"])
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
      />

      <DeleteAndBackLinkFooter
        id={operator.id}
        deleteAction={{ mutate: () => deleteOperatorMutation({ id: operator.id, projectSlug }) }}
        fieldName="Baulastträger"
        backHref={returnPath}
        backText="Zurück zu den Baulastträgern"
      />

      <SuperAdminLogData data={{ operator }} />
    </>
  )
}
