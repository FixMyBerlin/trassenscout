import { useMutation, useQuery } from "@tanstack/react-query"
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
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { H3 } from "@/src/components/core/components/text/Headings"
import { HeadingWithAction } from "@/src/components/core/components/text/HeadingWithAction"
import { ProjectRecordFormFields } from "@/src/components/project-records/ProjectRecordFormFields"
import { getDate } from "@/src/components/project-records/utils/splitStartAt"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { createProjectRecordFn } from "@/src/server/projectRecords/projectRecords.functions"
import { projectRecordTemplatesByProjectQueryOptions } from "@/src/server/projectRecordTemplates/projectRecordTemplatesQueryOptions"
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
  }
}

const pickerOptionButtonClassName =
  "flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left text-blue-700 hover:bg-blue-50"

type ProjectRecordCreateFormProps = {
  formKey: string
  formInitialValues: Record<string, unknown>
  projectSlug: string
  createRelationContext: "project" | "subsubsection" | "acquisitionArea"
  landAcquisitionModuleEnabled: boolean
  onDirtyChange: (isDirty: boolean) => void
  onSubmit: (values: z.infer<typeof NewProjectRecordFormSchema>) => Promise<void | OnSubmitResult>
}

function ProjectRecordCreateForm({
  formKey: _formKey,
  formInitialValues,
  projectSlug,
  createRelationContext,
  landAcquisitionModuleEnabled,
  onDirtyChange,
  onSubmit,
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
    <FormShell form={form} formError={formError} submitText="Protokolleintrag speichern">
      <FormDirtyStateReporter onDirtyChange={onDirtyChange} />
      <ProjectRecordFormFields
        formMode="create"
        relationContext={createRelationContext}
        projectSlug={projectSlug}
        landAcquisitionModuleEnabled={landAcquisitionModuleEnabled}
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
  const userCanEdit = useUserCan().edit
  const { data: templates = [] } = useQuery({
    ...projectRecordTemplatesByProjectQueryOptions({ projectSlug }),
    enabled: userCanEdit,
  })
  const [isDirty, setIsDirty] = useState(false)
  const [modalStep, setModalStep] = useState<"picker" | "form">("picker")
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
      const { uploads, projectRecordTopics, subsubsections, acquisitionAreas, ...restValues } =
        values
      const projectRecord = await createProjectRecordMutation.mutateAsync({
        data: {
          ...restValues,
          date: values.date,
          projectSlug,
          uploads,
          projectRecordTopics,
          subsubsections,
          acquisitionAreas,
        },
      })
      if (onSuccess) {
        await onSuccess(projectRecord.id)
      }
      resetAndClose()
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  const formInitialValues = {
    date: getDate(new Date()),
    editingState: ProjectRecordEditingState.PENDING,
    ...(initialValues?.subsubsectionId && {
      subsubsections: [String(initialValues.subsubsectionId)],
    }),
    ...(initialValues?.acquisitionAreaId && {
      acquisitionAreas: [String(initialValues.acquisitionAreaId)],
    }),
    ...(selectedTemplate && {
      title: selectedTemplate.entryTitle,
      body: selectedTemplate.body || "",
      projectRecordTopics: selectedTemplate.projectRecordTopics.map((topic) => String(topic.id)),
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
    <IfUserCanEdit>
      <Modal
        open={pickerOpen}
        handleClose={resetAndClose}
        align="center"
        className="space-y-4 sm:max-w-2xl"
      >
        <HeadingWithAction>
          <H3>Neuer Protokolleintrag</H3>
          <ModalCloseButton onClose={resetAndClose} />
        </HeadingWithAction>

        <div className="space-y-4">
          <p className="text-gray-600">
            Möchten Sie eine Vorlage nutzen oder mit einem leeren Formular starten?
          </p>
          <button
            type="button"
            onClick={() => switchToForm(null)}
            className={pickerOptionButtonClassName}
          >
            <span>Leeres Formular</span>
            <span>→</span>
          </button>

          {!!templates.length && (
            <>
              <h4 className="text-lg font-semibold text-gray-700">Vorlagen</h4>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => switchToForm(template)}
                    className={pickerOptionButtonClassName}
                  >
                    <span>{template.templateTitle}</span>
                    <span>→</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal open={formOpen} handleClose={handleClose} align="right" className="space-y-4">
        <HeadingWithAction>
          <H3>Neuer Protokolleintrag</H3>
          <ModalCloseButton onClose={handleClose} />
        </HeadingWithAction>

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
      </Modal>
    </IfUserCanEdit>
  )
}
