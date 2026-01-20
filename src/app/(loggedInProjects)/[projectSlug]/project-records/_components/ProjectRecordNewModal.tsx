"use client"

import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { getDate } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/splitStartAt"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Form, FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { SubmitButton } from "@/src/core/components/forms/SubmitButton"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import createProjectRecord from "@/src/server/projectRecords/mutations/createProjectRecord"
import { NewProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
import { useMutation } from "@blitzjs/rpc"

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

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const projectRecord = await createProjectRecordMutation({
        ...values,
        date: values.date ? new Date(values.date) : null,
        projectSlug,
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
        >
          <div className="space-y-6">
            <ProjectRecordFormFields projectSlug={projectSlug} />
            <SubmitButton>Protokolleintrag speichern</SubmitButton>
          </div>
        </Form>
      </Modal>
    </IfUserCanEdit>
  )
}
