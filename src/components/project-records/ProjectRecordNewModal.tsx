import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { z } from "zod"
import { FormDirtyStateReporter } from "@/src/components/core/components/forms/FormDirtyStateReporter"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { FormModal } from "@/src/components/core/components/Modal/FormModal"
import type { ProjectRecordEmailSourceValue } from "@/src/components/project-records/ProjectRecordEmailSource"
import { ProjectRecordFormFields } from "@/src/components/project-records/ProjectRecordFormFields"
import { useProjectRecordModal } from "@/src/components/project-records/ProjectRecordModalHost"
import { ProjectRecordTemplatePickerModal } from "@/src/components/project-records/ProjectRecordTemplatePickerModal"
import { getDate } from "@/src/components/project-records/utils/splitStartAt"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { createProjectRecordFn } from "@/src/server/projectRecords/projectRecords.functions"
import type { ProjectRecordTemplateOption } from "@/src/server/projectRecordTemplates/types"
import {
  newProjectRecordFormDefaultValues,
  NewProjectRecordFormSchema,
} from "@/src/shared/projectRecords/schemas"

type Props = {
  projectSlug: string
  open: boolean
  onClose: () => void
  onSuccess?: (projectRecordId: number) => void | Promise<void>
  landAcquisitionModuleEnabled?: boolean
  initialValues?: {
    subsubsectionId?: number
    acquisitionAreaId?: number
    title?: string
    body?: string
    editingState?: ProjectRecordEditingState
    assignedToId?: number
    tags?: string[]
  }
}

type ProjectRecordCreateFormProps = {
  formKey: string
  formInitialValues: Record<string, unknown>
  projectSlug: string
  createRelationContext: "project" | "subsubsection" | "acquisitionArea"
  landAcquisitionModuleEnabled: boolean
  onDirtyChange?: (isDirty: boolean) => void
  onSubmit: (values: z.infer<typeof NewProjectRecordFormSchema>) => Promise<void | OnSubmitResult>
  // The Posteingang shows the source mail next to the form.
  emailSource?: ProjectRecordEmailSourceValue
  submitText?: string
}

export function ProjectRecordCreateForm({
  formKey: _formKey,
  formInitialValues,
  projectSlug,
  createRelationContext,
  landAcquisitionModuleEnabled,
  onDirtyChange,
  onSubmit,
  emailSource,
  submitText = "Protokolleintrag speichern",
}: ProjectRecordCreateFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...newProjectRecordFormDefaultValues, ...formInitialValues } as never,
    validators: { onSubmit: NewProjectRecordFormSchema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value)) || {}
      applyFormSubmitResult(form, result, setFormError)
      if (!result.FORM_ERROR) {
        form.reset()
        setFormError(null)
      }
    },
  })

  return (
    <FormShell form={form} formError={formError} submitText={submitText} backLink={null}>
      <FormDirtyStateReporter onDirtyChange={onDirtyChange} />
      <ProjectRecordFormFields
        formMode="create"
        relationContext={createRelationContext}
        projectSlug={projectSlug}
        landAcquisitionModuleEnabled={landAcquisitionModuleEnabled}
        splitView={Boolean(emailSource)}
        emailSource={emailSource}
        disableSuspenseQueries
      />
    </FormShell>
  )
}

export const ProjectRecordNewModal = ({
  projectSlug,
  open,
  onClose,
  onSuccess,
  landAcquisitionModuleEnabled = false,
  initialValues,
}: Props) => {
  const createProjectRecordMutation = useMutation({ mutationFn: createProjectRecordFn })
  const { openProjectRecordDetail } = useProjectRecordModal()
  const [isDirty, setIsDirty] = useState(false)
  const [modalStep, setModalStep] = useState<"picker" | "form">(
    initialValues?.title ? "form" : "picker",
  )
  const [isSwitchingStep, setIsSwitchingStep] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectRecordTemplateOption | null>(null)

  const resetAndClose = () => {
    setIsSwitchingStep(false)
    setModalStep("picker")
    setSelectedTemplate(null)
    setIsDirty(false)
    onClose()
  }

  const handleClose = () => {
    if (isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return
    resetAndClose()
  }

  const createRelationContext: "project" | "subsubsection" | "acquisitionArea" =
    initialValues?.acquisitionAreaId
      ? "acquisitionArea"
      : initialValues?.subsubsectionId
        ? "subsubsection"
        : "project"

  type HandleSubmit = z.infer<typeof NewProjectRecordFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const { uploads, tags, subsubsections, acquisitionAreas, formTemplates, ...restValues } =
        values
      const projectRecord = await createProjectRecordMutation.mutateAsync({
        data: {
          ...restValues,
          date: values.date,
          projectSlug,
          uploads,
          tags,
          subsubsections,
          acquisitionAreas,
          formTemplates,
        },
      })
      if (onSuccess) {
        await onSuccess(projectRecord.id)
      }
      resetAndClose()
      openProjectRecordDetail({
        projectRecordId: projectRecord.id,
        previewProjectRecord: { id: projectRecord.id, title: projectRecord.title },
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  const formInitialValues = {
    date: getDate(new Date()),
    editingState: initialValues?.editingState ?? ProjectRecordEditingState.PENDING,
    ...(initialValues?.title ? { title: initialValues.title } : {}),
    ...(initialValues?.body != null ? { body: initialValues.body } : {}),
    ...(initialValues?.assignedToId != null ? { assignedToId: initialValues.assignedToId } : {}),
    ...(initialValues?.tags != null ? { tags: initialValues.tags } : {}),
    ...(initialValues?.subsubsectionId && {
      subsubsections: [String(initialValues.subsubsectionId)],
    }),
    ...(initialValues?.acquisitionAreaId && {
      acquisitionAreas: [String(initialValues.acquisitionAreaId)],
    }),
    ...(selectedTemplate && {
      title: selectedTemplate.entryTitle,
      body: selectedTemplate.body || "",
      tags: selectedTemplate.tags.map((tag) => String(tag.id)),
      // The entry gets its own copy of the template's forms; the server does the same for
      // non-admins, whose payload it does not trust.
      formTemplates: selectedTemplate.formTemplates.map((formTemplate) => String(formTemplate.id)),
      // Provenance: which template this entry was started from.
      projectRecordTemplateId: selectedTemplate.id,
    }),
  }

  const pickerOpen = open && (modalStep === "picker" || isSwitchingStep)
  const formOpen = open && (modalStep === "form" || isSwitchingStep)
  const formKey = [
    "template",
    selectedTemplate?.id || "blank",
    initialValues?.subsubsectionId || "nosubsubsection",
    initialValues?.acquisitionAreaId || "noacquisitionarea",
  ].join("-")

  const switchToForm = (template: ProjectRecordTemplateOption | null) => {
    setSelectedTemplate(template)
    setIsSwitchingStep(true)
    requestAnimationFrame(() => {
      setModalStep("form")
      setIsSwitchingStep(false)
    })
  }

  return (
    <>
      <ProjectRecordTemplatePickerModal
        projectSlug={projectSlug}
        open={pickerOpen}
        onClose={resetAndClose}
        onSelect={switchToForm}
      />

      <FormModal open={formOpen} title="Neuer Protokolleintrag" onClose={handleClose} align="right">
        <ProjectRecordCreateForm
          key={formKey}
          formKey={formKey}
          formInitialValues={formInitialValues}
          projectSlug={projectSlug}
          createRelationContext={createRelationContext}
          landAcquisitionModuleEnabled={landAcquisitionModuleEnabled}
          onDirtyChange={setIsDirty}
          onSubmit={handleSubmit}
        />
      </FormModal>
    </>
  )
}
