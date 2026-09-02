import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  deleteFormTemplateFn,
  updateFormTemplateFn,
} from "@/src/server/formTemplates/formTemplates.functions"
import { formTemplateQueryOptions } from "@/src/server/formTemplates/formTemplatesQueryOptions"
import { parseFieldDefinitions } from "@/src/shared/formTemplates/fieldSchemas"
import type { FormTemplateFormValues } from "@/src/shared/formTemplates/schemas"
import { AdminFormTemplateForm } from "../../AdminFormTemplateForm"

type Props = {
  templateId: number
}

export const AdminFormTemplateEditForm = ({ templateId }: Props) => {
  const navigate = useNavigate()
  const { data: template } = useSuspenseQuery(formTemplateQueryOptions(templateId))
  const updateFormTemplateMutation = useMutation({ mutationFn: updateFormTemplateFn })
  const deleteFormTemplateMutation = useMutation({ mutationFn: deleteFormTemplateFn })

  const handleSubmit = async (values: FormTemplateFormValues) => {
    try {
      await updateFormTemplateMutation.mutateAsync({ data: { id: template.id, ...values } })
      navigate({ to: "/admin/form-templates" })
    } catch (error: unknown) {
      // `slug` is unique across all form templates, so a collision is the likely failure here;
      // this turns the raw Prisma error into a message on the field itself.
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <AdminFormTemplateForm
      submitText="Speichern"
      onSubmit={handleSubmit}
      actionBarRight={
        <DeleteActionBar
          itemTitle={template.title}
          onDelete={() => deleteFormTemplateMutation.mutateAsync({ data: { id: template.id } })}
          returnPath="/admin/form-templates"
        />
      }
      initialValues={{
        title: template.title,
        slug: template.slug,
        type: template.type,
        bodyMarkdown: template.bodyMarkdown,
        fields: parseFieldDefinitions(template.fields),
        projectIds: template.projects.map((project) => String(project.id)),
      }}
    />
  )
}
