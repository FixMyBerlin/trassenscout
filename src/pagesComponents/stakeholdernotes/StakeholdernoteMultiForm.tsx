import { Form, FormProps, LabeledTextareaField } from "@/src/core/components/forms"
import { z } from "zod"

export function StakeholdernoteMultiForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextareaField name="title" label="Namen (ein Stakeholder pro Zeile)" placeholder="" />
    </Form>
  )
}
