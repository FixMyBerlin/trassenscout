import { Form, FormProps } from "@/src/core/components/forms"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { z } from "zod"

export function UserEditForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> className="max-w-prose" {...props}>
      <LabeledTextField name="firstName" label="Vorname" placeholder="" autoComplete="given-name" />
      <LabeledTextField
        name="lastName"
        label="Nachname"
        placeholder=""
        autoComplete="family-name"
      />
      <LabeledTextField name="institution" label="Organisation / Kommune" placeholder="" optional />
      <LabeledTextField
        type="tel"
        name="phone"
        label="Telefon"
        placeholder=""
        autoComplete="tel"
        optional
      />
    </Form>
  )
}
