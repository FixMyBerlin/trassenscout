import { Form, FormProps, LabeledTextareaField, LabeledTextField } from "@/src/core/components/forms"
import { z } from "zod"

type Props = FormProps<z.ZodType<any, any>>

export const EvaluationsPageForm = (props: Props) => {
  return (
    <Form {...props}>
      <LabeledTextField type="text" name="title" label="Titel" />
      <LabeledTextareaField name="markdown" label="Text (Markdown)" rows={12} />
    </Form>
  )
}
