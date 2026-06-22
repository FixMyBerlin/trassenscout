"use client"

import { FORM_ERROR } from "@/src/core/components/forms"
import upsertEvaluationsPage from "@/src/server/evaluationsPage/mutations/upsertEvaluationsPage"
import getEvaluationsPage from "@/src/server/evaluationsPage/queries/getEvaluationsPage"
import {
  EvaluationsPageFormSchema,
  EvaluationsPageFormValues,
} from "@/src/server/evaluationsPage/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { EvaluationsPageForm } from "./EvaluationsPageForm"

export const AdminEvaluationsPageEditForm = () => {
  const router = useRouter()
  const [page] = useQuery(getEvaluationsPage, {})
  const [upsertEvaluationsPageMutation] = useMutation(upsertEvaluationsPage)

  const handleSubmit = async (values: EvaluationsPageFormValues) => {
    try {
      await upsertEvaluationsPageMutation(values)
      router.push("/admin")
    } catch (error: unknown) {
      console.error(error)
      const message = error instanceof Error ? error.message : String(error)
      return { [FORM_ERROR]: message }
    }
  }

  return (
    <EvaluationsPageForm
      submitText="Speichern"
      schema={EvaluationsPageFormSchema}
      initialValues={{
        title: page.title,
        markdown: page.markdown,
      }}
      onSubmit={handleSubmit}
    />
  )
}
