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

export function ProjectForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & { users: User[] }
) {
  const { users } = props

  return (
    <Form<S> {...props}>
      <LabeledTextField type="text" name="name" label="Name" placeholder="" />
      <LabeledTextField type="text" name="shortName" label="Kurzname" placeholder="" optional />
      <LabeledTextareaField
        name="introduction"
        label="Introduction (Markdown)"
        placeholder=""
        optional
      />
      <LabeledSelect
        name="userId"
        label="Projektleiter:in"
        options={users.map((u) => [u.id.toString(), u.email])}
      />
    </Form>
  )
}
