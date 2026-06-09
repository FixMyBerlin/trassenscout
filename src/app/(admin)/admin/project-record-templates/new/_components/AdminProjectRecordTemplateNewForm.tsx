"use client"

import { FORM_ERROR } from "@/src/core/components/forms/utils/formSubmitResult"
import createProjectRecordTemplate from "@/src/server/projectRecordTemplates/mutations/createProjectRecordTemplate"
import { ProjectRecordTemplateFormValues } from "@/src/server/projectRecordTemplates/schema"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { AdminProjectRecordTemplateForm } from "../../_components/AdminProjectRecordTemplateForm"

export const AdminProjectRecordTemplateNewForm = () => {
  const router = useRouter()
  const [createProjectRecordTemplateMutation] = useMutation(createProjectRecordTemplate)

  const handleSubmit = async (values: ProjectRecordTemplateFormValues) => {
    try {
      await createProjectRecordTemplateMutation(values)
      router.push("/admin/project-record-templates")
    } catch (error: any) {
      return { [FORM_ERROR]: error.toString() }
    }
  }

  return (
    <AdminProjectRecordTemplateForm
      submitText="Erstellen"
      onSubmit={handleSubmit}
      initialValues={{
        templateTitle: "",
        entryTitle: "",
        body: "",
        purpose: "",
        projectIds: [],
        projectRecordTopicIds: [],
      }}
    />
  )
}
