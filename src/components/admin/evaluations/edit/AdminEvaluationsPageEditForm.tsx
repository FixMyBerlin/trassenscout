import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { upsertEvaluationsPageFn } from "@/src/server/evaluationsPage/evaluationsPage.functions"
import { UpsertEvaluationsPageSchema } from "@/src/server/evaluationsPage/evaluationsPage.inputSchemas"
import { evaluationsPageQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"
import { EvaluationsPageForm } from "./EvaluationsPageForm"

export const AdminEvaluationsPageEditForm = () => {
  const navigate = useNavigate()
  const { data: evaluationsPage } = useSuspenseQuery(evaluationsPageQueryOptions())
  const upsertMutation = useMutation({ mutationFn: upsertEvaluationsPageFn })

  const handleSubmit = async (values: { title: string; markdown: string }) => {
    try {
      await upsertMutation.mutateAsync({ data: values })
      navigate({ to: "/admin" })
    } catch (error: unknown) {
      console.error(error)
      return { [FORM_ERROR]: error instanceof Error ? error.message : String(error) }
    }
  }

  return (
    <EvaluationsPageForm
      key={`${evaluationsPage.title}:${evaluationsPage.markdown}`}
      submitText="Speichern"
      schema={UpsertEvaluationsPageSchema}
      initialValues={evaluationsPage}
      onSubmit={handleSubmit}
      submitDisabled={upsertMutation.isPending}
    />
  )
}
