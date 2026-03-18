import {
  Form,
  FormProps,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { z } from "zod"

type Props = FormProps<z.ZodType<any, any>>

export const SupportDocumentForm = (props: Props) => {
  return (
    <Form {...props}>
      {(form) => (
        <>
          <LabeledTextField form={form} type="text" name="title" label="Titel" />
          <LabeledTextareaField form={form} name="description" label="Beschreibung" optional />
          <LabeledTextField form={form} type="number" name="order" label="Reihenfolge" />
        </>
      )}
    </Form>
  )
}
