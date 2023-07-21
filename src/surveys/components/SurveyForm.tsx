import { Form, FormProps, LabeledCheckbox, LabeledTextField } from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function SurveyForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField type="text" name="slug" label="Slug" />
      <LabeledTextField type="text" name="title" label="Titel" placeholder="" />
      <LabeledCheckbox value="active" label="Active" scope="active" />
    </Form>
  )
}
