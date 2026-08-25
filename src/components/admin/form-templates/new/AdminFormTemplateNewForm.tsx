import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { createFormTemplateFn } from "@/src/server/formTemplates/formTemplates.functions"
import type { FormTemplateFormValues } from "@/src/shared/formTemplates/schemas"
import { AdminFormTemplateForm } from "../AdminFormTemplateForm"

export const AdminFormTemplateNewForm = () => {
  const navigate = useNavigate()
  const createFormTemplateMutation = useMutation({ mutationFn: createFormTemplateFn })

  const handleSubmit = async (values: FormTemplateFormValues) => {
    try {
      await createFormTemplateMutation.mutateAsync({ data: values })
      navigate({ to: "/admin/form-templates" })
    } catch (error: unknown) {
      // `slug` is unique across all form templates, so a collision is the likely failure here;
      // this turns the raw Prisma error into a message on the field itself.
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return <AdminFormTemplateForm submitText="Erstellen" onSubmit={handleSubmit} />
}
