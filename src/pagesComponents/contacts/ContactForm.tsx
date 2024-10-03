import {
  Form,
  FormProps,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { z } from "zod"

export function ContactForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> className="max-w-prose" {...props}>
      <LabeledTextField type="text" name="firstName" label="Vorname" optional placeholder="" />
      <LabeledTextField type="text" name="lastName" label="Nachname" placeholder="" />
      <LabeledTextField type="text" name="email" label="E-Mail-Adresse" placeholder="" />
      <LabeledTextField type="text" name="phone" label="Telefonnummer" optional placeholder="" />
      <LabeledTextareaField name="note" label="Notizen (Markdown)" optional placeholder="" />
      <LabeledTextField type="text" name="role" label="Position" optional placeholder="" />
    </Form>
  )
}
