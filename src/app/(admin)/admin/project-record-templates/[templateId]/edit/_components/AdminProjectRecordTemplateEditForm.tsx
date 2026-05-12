"use client"

import { blueButtonStyles } from "@/src/core/components/links"
import { FORM_ERROR } from "@/src/core/components/forms"
import deleteProjectRecordTemplate from "@/src/server/projectRecordTemplates/mutations/deleteProjectRecordTemplate"
import updateProjectRecordTemplate from "@/src/server/projectRecordTemplates/mutations/updateProjectRecordTemplate"
import getAdminProjectRecordTemplate from "@/src/server/projectRecordTemplates/queries/getAdminProjectRecordTemplate"
import { ProjectRecordTemplateFormValues } from "@/src/server/projectRecordTemplates/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useParams, useRouter } from "next/navigation"
import { AdminProjectRecordTemplateForm } from "../../../_components/AdminProjectRecordTemplateForm"

export const AdminProjectRecordTemplateEditForm = () => {
  const router = useRouter()
  const templateId = Number(useParams()?.templateId)

  const [template] = useQuery(getAdminProjectRecordTemplate, { id: templateId })
  const [updateProjectRecordTemplateMutation] = useMutation(updateProjectRecordTemplate)
  const [deleteProjectRecordTemplateMutation] = useMutation(deleteProjectRecordTemplate)

  const handleSubmit = async (values: ProjectRecordTemplateFormValues) => {
    try {
      await updateProjectRecordTemplateMutation({ id: template.id, ...values })
      router.push("/admin/project-record-templates")
    } catch (error: any) {
      return { [FORM_ERROR]: error.toString() }
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Vorlage wirklich löschen?")) return
    await deleteProjectRecordTemplateMutation({ id: template.id })
    router.push("/admin/project-record-templates")
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
