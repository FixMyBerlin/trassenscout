import { useState } from "react"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { applyFormSubmitResult } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { SubsubsectionExtraFieldDefinitionSchema } from "@/src/shared/subsubsections/extraFieldSchemas"

const ExtraFieldDefinitionFormSchema = SubsubsectionExtraFieldDefinitionSchema.pick({
  name: true,
  label: true,
})

type FormValues = z.infer<typeof ExtraFieldDefinitionFormSchema>

type Props = {
  open: boolean
  title: string
  submitText: string
  initialValues: FormValues
  nameReadOnly?: boolean
  onClose: () => void
  onSubmit: (values: FormValues) => { error?: string } | void
}

export function ExtraFieldDefinitionModal({
  open,
  title,
  submitText,
  initialValues,
  nameReadOnly = false,
  onClose,
  onSubmit,
}: Props) {
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onSubmit: ExtraFieldDefinitionFormSchema } as never,
    onSubmit: async ({ value }) => {
      const result = onSubmit(value)
      if (result?.error) {
        setFormError(result.error)
        return
      }
      applyFormSubmitResult(form, {}, setFormError)
      onClose()
    },
  })

  return (
    <Modal open={open} handleClose={onClose} className="sm:max-w-lg">
      <PageHeader title={title} action={<ModalCloseButton onClose={onClose} />} />
      <FormShell form={form} formError={formError} submitText={submitText} backLink={null}>
        <form.AppField name="label">
          {(field) => <field.TextField type="text" label="Bezeichnung" />}
        </form.AppField>
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              type="text"
              label="Feldname (intern)"
              help="Erlaubte Zeichen: a-z, 0-9, -, ., _"
              disabled={nameReadOnly}
            />
          )}
        </form.AppField>
      </FormShell>
    </Modal>
  )
}
