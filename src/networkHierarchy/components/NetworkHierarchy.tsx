import { Form, FormProps, LabeledTextField } from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function NetworkHierarchyForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const { ...formProps } = props

  return (
    <Form<S> {...formProps}>
      <LabeledTextField type="text" name="slug" label="Kurz-Titel und URL-Teil" />
      <LabeledTextField type="text" name="title" label="Titel" />
    </Form>
  )
}
