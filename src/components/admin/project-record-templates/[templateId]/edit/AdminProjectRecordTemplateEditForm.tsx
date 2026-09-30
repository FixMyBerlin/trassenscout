import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  deleteProjectRecordTemplateFn,
  updateProjectRecordTemplateFn,
} from "@/src/server/projectRecordTemplates/projectRecordTemplates.functions"
import { projectRecordTemplateQueryOptions } from "@/src/server/projectRecordTemplates/projectRecordTemplatesQueryOptions"
import { ProjectRecordTemplateFormValues } from "@/src/shared/projectRecordTemplates/schemas"
import { AdminProjectRecordTemplateForm } from "../../AdminProjectRecordTemplateForm"

type Props = {
  templateId: number
}

export const AdminProjectRecordTemplateEditForm = ({ templateId }: Props) => {
  const navigate = useNavigate()
  const { data: template } = useSuspenseQuery(projectRecordTemplateQueryOptions(templateId))
  const updateProjectRecordTemplateMutation = useMutation({
    mutationFn: updateProjectRecordTemplateFn,
  })
  const deleteProjectRecordTemplateMutation = useMutation({
    mutationFn: deleteProjectRecordTemplateFn,
  })

  const handleSubmit = async (values: ProjectRecordTemplateFormValues) => {
    try {
      await updateProjectRecordTemplateMutation.mutateAsync({
        data: { id: template.id, ...values },
      })
      navigate({ to: "/admin/project-record-templates" })
    } catch (error: unknown) {
      return { [FORM_ERROR]: String(error) }
    }
  }

  return (
    <AdminProjectRecordTemplateForm
      submitText="Speichern"
      onSubmit={handleSubmit}
      actionBarRight={
        <DeleteActionBar
          itemTitle={template.templateTitle}
          onDelete={() =>
            deleteProjectRecordTemplateMutation.mutateAsync({ data: { id: template.id } })
          }
          returnPath="/admin/project-record-templates"
        />
      }
      initialValues={{
        templateTitle: template.templateTitle,
        entryTitle: template.entryTitle,
        body: template.body || "",
        purpose: template.purpose || "",
        projectIds: template.projects.map((project) => String(project.id)),
        tagIds: template.tags.map((tag) => String(tag.id)),
        formTemplateIds: template.formTemplates.map((formTemplate) => String(formTemplate.id)),
        uploadIds: template.uploads.map((upload) => String(upload.id)),
      }}
    />
  )
}
