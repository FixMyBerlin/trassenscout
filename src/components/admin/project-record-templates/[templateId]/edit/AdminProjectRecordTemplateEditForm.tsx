import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { clsx } from "clsx"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { blueButtonStyles } from "@/src/components/core/components/links/styles"
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

  const handleDelete = async () => {
    if (!window.confirm("Vorlage wirklich löschen?")) return
    await deleteProjectRecordTemplateMutation.mutateAsync({ data: { id: template.id } })
    navigate({ to: "/admin/project-record-templates" })
  }

  return (
    <div className="space-y-6">
      <AdminProjectRecordTemplateForm
        submitText="Speichern"
        onSubmit={handleSubmit}
        initialValues={{
          templateTitle: template.templateTitle,
          entryTitle: template.entryTitle,
          body: template.body || "",
          purpose: template.purpose || "",
          projectIds: template.projects.map((project) => String(project.id)),
          projectRecordTopicIds: template.projectRecordTopics.map((topic) => String(topic.id)),
        }}
      />

      <button
        type="button"
        onClick={handleDelete}
        className={clsx(blueButtonStyles, "bg-red-700! hover:bg-red-800!")}
      >
        Vorlage löschen
      </button>
    </div>
  )
}
