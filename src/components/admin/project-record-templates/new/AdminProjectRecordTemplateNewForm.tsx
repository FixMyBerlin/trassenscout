import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { createProjectRecordTemplateFn } from "@/src/server/projectRecordTemplates/projectRecordTemplates.functions"
import { ProjectRecordTemplateFormValues } from "@/src/shared/projectRecordTemplates/schemas"
import { AdminProjectRecordTemplateForm } from "../AdminProjectRecordTemplateForm"

export const AdminProjectRecordTemplateNewForm = () => {
  const navigate = useNavigate()
  const createProjectRecordTemplateMutation = useMutation({
    mutationFn: createProjectRecordTemplateFn,
  })

  const handleSubmit = async (values: ProjectRecordTemplateFormValues) => {
    try {
      await createProjectRecordTemplateMutation.mutateAsync({ data: values })
      navigate({ to: "/admin/project-record-templates" })
    } catch (error: unknown) {
      return { [FORM_ERROR]: String(error) }
    }
  }

  return <AdminProjectRecordTemplateForm submitText="Erstellen" onSubmit={handleSubmit} />
}
