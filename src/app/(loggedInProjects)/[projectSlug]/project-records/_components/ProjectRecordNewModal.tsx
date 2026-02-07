"use client"

import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { getDate } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/splitStartAt"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Form, FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import createProjectRecord from "@/src/server/projectRecords/mutations/createProjectRecord"
import { NewProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
import { useMutation } from "@blitzjs/rpc"
import { z } from "zod"

type Props = {
  projectSlug: string
  open: boolean
  onClose: () => void
  onSuccess?: (projectRecordId: number) => void | Promise<void>
  initialValues?: {
    subsubsectionId?: number
  }
}

export const ProjectRecordNewModal = ({
  projectSlug,
  open,
  onClose,
  onSuccess,
  initialValues,
}: Props) => {
  const [createProjectRecordMutation] = useMutation(createProjectRecord)

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
      onClose()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  const formInitialValues = {
    date: getDate(new Date()),
    ...(initialValues?.subsubsectionId && {
      subsubsectionId: initialValues.subsubsectionId,
    }),
  }

  return (
    <IfUserCanEdit>
      <Modal open={open} handleClose={onClose} className="space-y-4 sm:max-w-3xl">
        <HeadingWithAction>
          <H3>Neuer Protokolleintrag</H3>
          <ModalCloseButton onClose={onClose} />
        </HeadingWithAction>

        <Form
          resetOnSubmit
          onSubmit={handleSubmit}
          initialValues={formInitialValues}
          schema={NewProjectRecordFormSchema}
          submitText="Protokolleintrag speichern"
        >
          <ProjectRecordFormFields projectSlug={projectSlug} />
        </Form>
      </Modal>
    </IfUserCanEdit>
  )
}
