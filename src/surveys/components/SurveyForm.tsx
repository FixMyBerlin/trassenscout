import { Form, FormProps, LabeledTextField } from "src/core/components/forms"
import { z } from "zod"
import { quote } from "../../core/components/text"
export { FORM_ERROR } from "src/core/components/forms"

export function SurveyForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="Slug"
        help={`Empfohlenes Format: ${quote("rs99")}. Primäre Auszeichnung der Umfrage.`}
      />
    </Form>
  )
}
