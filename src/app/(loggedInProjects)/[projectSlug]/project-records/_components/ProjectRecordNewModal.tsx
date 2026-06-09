"use client"

import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { getDate } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/splitStartAt"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { FormDirtyStateReporter } from "@/src/core/components/forms/FormDirtyStateReporter"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import createProjectRecord from "@/src/server/projectRecords/mutations/createProjectRecord"
import {
  newProjectRecordFormDefaultValues,
  NewProjectRecordFormSchema,
} from "@/src/server/projectRecords/schemas"
import getProjectRecordTemplatesByProject from "@/src/server/projectRecordTemplates/queries/getProjectRecordTemplatesByProject"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ProjectRecordEditingState } from "@prisma/client"
import { useState } from "react"
import { z } from "zod"

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

type ProjectRecordTemplateOption = Awaited<
  ReturnType<typeof getProjectRecordTemplatesByProject>
>[number]

const pickerOptionButtonClassName =
  "flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left text-blue-700 hover:bg-blue-50"

type ProjectRecordCreateFormProps = {
  formKey: string
  formInitialValues: Record<string, unknown>
  projectSlug: string
  createRelationContext: "project" | "subsubsection" | "acquisitionArea"
  landAcquisitionModuleEnabled: boolean
  onDirtyChange: (isDirty: boolean) => void
  onSubmit: (
    values: z.infer<typeof NewProjectRecordFormSchema>,
  ) => Promise<void | import("@/src/core/components/forms/utils/formSubmitResult").OnSubmitResult>
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
  const [createProjectRecordMutation] = useMutation(createProjectRecord)
  const [templates = []] = useQuery(
    getProjectRecordTemplatesByProject,
    { projectSlug },
    {
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
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
      // Exclude m2m fields that are transformed by the form schema but need different format for mutation
      const { uploads, projectRecordTopics, subsubsections, acquisitionAreas, ...restValues } =
        values
      const projectRecord = await createProjectRecordMutation({
        ...restValues,
        date: values.date ? new Date(values.date) : null,
        projectSlug,
        uploads: Array.isArray(uploads) ? uploads : undefined,
        projectRecordTopics: Array.isArray(projectRecordTopics) ? projectRecordTopics : undefined,
        subsubsections: Array.isArray(subsubsections) ? subsubsections : undefined,
        acquisitionAreas: Array.isArray(acquisitionAreas) ? acquisitionAreas : undefined,
      })
      if (onSuccess) {
        await onSuccess(projectRecord.id)
      }
      resetAndClose()
    } catch (error: any) {
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
      projectRecordTopics: selectedTemplate.topicIds.map(String) as unknown as z.infer<
        typeof NewProjectRecordFormSchema
      >["projectRecordTopics"],
    }),
  }

  const pickerOpen = open && (modalStep === "picker" || isSwitchingStep)
  const formOpen = open && (modalStep === "form" || isSwitchingStep)

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
          key={[
            "template",
            selectedTemplate?.id || "blank",
            initialValues?.subsubsectionId || "nosubsubsection",
            initialValues?.acquisitionAreaId || "noacquisitionarea",
          ].join("-")}
          formKey={[
            "template",
            selectedTemplate?.id || "blank",
            initialValues?.subsubsectionId || "nosubsubsection",
            initialValues?.acquisitionAreaId || "noacquisitionarea",
          ].join("-")}
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
