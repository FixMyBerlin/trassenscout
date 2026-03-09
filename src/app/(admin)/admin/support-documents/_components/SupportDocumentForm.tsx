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
      <LabeledTextField type="text" name="title" label="Titel" />
      <LabeledTextareaField name="description" label="Beschreibung" optional />
      <LabeledTextField type="number" name="order" label="Reihenfolge" />
    </Form>
  )
}
