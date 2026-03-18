import {
  Form,
  FormProps,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { z } from "zod"

export function ContactForm<S extends z.ZodType<any, any>>(props: Omit<FormProps<S>, "children">) {
  return (
    <Form<S> className="max-w-prose" {...props}>
      {(form) => (
        <>
          <LabeledTextField
            form={form}
            type="text"
            name="firstName"
            label="Vorname"
            optional
            placeholder=""
          />
          <LabeledTextField
            form={form}
            type="text"
            name="lastName"
            label="Nachname"
            placeholder=""
          />
          <LabeledTextField
            form={form}
            type="text"
            name="email"
            label="E-Mail-Adresse"
            placeholder=""
          />
          <LabeledTextField
            form={form}
            type="text"
            name="phone"
            label="Telefonnummer"
            optional
            placeholder=""
          />
          <LabeledTextareaField
            form={form}
            name="note"
            label="Notizen (Markdown)"
            optional
            placeholder=""
          />
          <LabeledTextField
            form={form}
            type="text"
            name="role"
            label="Position"
            optional
            placeholder=""
          />
        </>
      )}
    </Form>
  )
}
