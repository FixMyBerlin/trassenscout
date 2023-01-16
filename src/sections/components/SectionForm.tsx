import { User } from "@prisma/client"
import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function SectionForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & { users: User[] }
) {
  const { users } = props

  return (
    <Form<S> {...props}>
      <LabeledTextField type="text" name="name" label="Name" placeholder="" />
      <LabeledTextareaField
        name="description"
        label="Beschreibung (Markdown)"
        placeholder=""
        optional
      />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={users.map((u) => [
          String(u.id),
          [u.firstName, u.lastName, `<${u.email}>`].join(" "),
        ])}
      />
    </Form>
  )
}
