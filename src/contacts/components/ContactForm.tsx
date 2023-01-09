import { Form, FormProps, LabeledTextField } from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function ContactForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField type="text" name="name" label="Vor- und Nachname" placeholder="" />
      <LabeledTextField type="text" name="email" label="E-Mail-Adresse" placeholder="" />
      <LabeledTextField type="text" name="phone" label="Telefonnummer" placeholder="" />
      <LabeledTextField type="text" name="title" label="Titel" placeholder="" />
      <LabeledTextField type="text" name="role" label="Position" placeholder="" />
    </Form>
  )
}
