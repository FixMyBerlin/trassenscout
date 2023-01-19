import { Form, FormProps, LabeledTextField } from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function FileForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField type="text" name="title" label="Name" placeholder="Name" />
      <LabeledTextField
        type="text"
        name="externalUrl"
        label="Externe Datei-URL"
        placeholder="Name"
      />
    </Form>
  )
}
