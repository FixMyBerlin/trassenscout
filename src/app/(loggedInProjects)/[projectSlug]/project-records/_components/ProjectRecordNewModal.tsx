"use client"

import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { getDate } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/splitStartAt"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Form, FORM_ERROR, FormDirtyStateReporter } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import createProjectRecord from "@/src/server/projectRecords/mutations/createProjectRecord"
import { NewProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
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
  initialValues?: {
    subsectionId?: number
    subsubsectionId?: number
    acquisitionAreaId?: number
  }
}

type ProjectRecordTemplateOption = Awaited<
  ReturnType<typeof getProjectRecordTemplatesByProject>
>[number]

const pickerOptionButtonClassName =
  "flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left text-blue-700 hover:bg-blue-50"

export const ProjectRecordNewModal = ({
  projectSlug,
  open,
  onClose,
  onSuccess,
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

  type HandleSubmit = z.infer<typeof NewProjectRecordFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      // Exclude m2m fields that are transformed by the form schema but need different format for mutation
      const { uploads, projectRecordTopics, ...restValues } = values
      const projectRecord = await createProjectRecordMutation({
        ...restValues,
        date: values.date ? new Date(values.date) : null,
        projectSlug,
        uploads: Array.isArray(uploads) ? uploads : undefined,
        projectRecordTopics: Array.isArray(projectRecordTopics) ? projectRecordTopics : undefined,
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
    ...(initialValues?.subsectionId && {
      subsectionId: initialValues.subsectionId,
    }),
    ...(initialValues?.subsubsectionId && {
      subsubsectionId: initialValues.subsubsectionId,
    }),
    ...(initialValues?.acquisitionAreaId && {
      acquisitionAreaId: initialValues.acquisitionAreaId,
    }),
    ...(selectedTemplate && {
      title: selectedTemplate.entryTitle,
      body: selectedTemplate.body || "",
      projectRecordTopics: selectedTemplate.topicIds,
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

        <Form
          key={[
            "template",
            selectedTemplate?.id || "blank",
            initialValues?.subsectionId || "nosubsection",
            initialValues?.subsubsectionId || "nosubsubsection",
            initialValues?.acquisitionAreaId || "noacquisitionarea",
          ].join("-")}
          resetOnSubmit
          onSubmit={handleSubmit}
          initialValues={formInitialValues}
          schema={NewProjectRecordFormSchema}
          submitText="Protokolleintrag speichern"
        >
          <FormDirtyStateReporter onDirtyChange={setIsDirty} />
          <ProjectRecordFormFields projectSlug={projectSlug} disableSuspenseQueries />
        </Form>
      </Modal>
    </IfUserCanEdit>
  )
}
