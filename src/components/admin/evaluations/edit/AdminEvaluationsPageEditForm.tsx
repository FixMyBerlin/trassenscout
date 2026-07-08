import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { upsertEvaluationsPageFn } from "@/src/server/evaluationsPage/evaluationsPage.functions"
import { EvaluationsPageContentSchema } from "@/src/server/evaluationsPage/evaluationsPage.inputSchemas"
import { evaluationsPageAdminQueryOptions } from "@/src/server/evaluationsPage/evaluationsPageQueryOptions"
import { EvaluationsPageForm } from "./EvaluationsPageForm"

type Props = {
  projectSlug: string
}

export const AdminEvaluationsPageEditForm = ({ projectSlug }: Props) => {
  const navigate = useNavigate()
  const { data: evaluationsPage } = useSuspenseQuery(
    evaluationsPageAdminQueryOptions({ projectSlug }),
  )
  const upsertMutation = useMutation({ mutationFn: upsertEvaluationsPageFn })

  const handleSubmit = async (values: { title: string; markdown: string }) => {
    try {
      await upsertMutation.mutateAsync({ data: { projectSlug, ...values } })
      navigate({ to: "/admin/evaluations" })
    } catch (error: unknown) {
      console.error(error)
      return { [FORM_ERROR]: error instanceof Error ? error.message : String(error) }
    }
  }

  return (
    <EvaluationsPageForm
      key={`${projectSlug}:${evaluationsPage.title}:${evaluationsPage.markdown}`}
      submitText="Speichern"
      schema={EvaluationsPageContentSchema}
      initialValues={evaluationsPage}
      onSubmit={handleSubmit}
      submitDisabled={upsertMutation.isPending}
    />
  )
}
