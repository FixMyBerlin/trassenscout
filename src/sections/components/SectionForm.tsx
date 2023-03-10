import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { getFullname } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function SectionForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & {
    users: { id: number; firstName: string | null; lastName: string | null }[]
  }
) {
  const { users } = props

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="URL-Segment"
        help="Änderungen am URL-Segement sorgen dafür, dass bisherige URLs nicht mehr funktionieren."
        placeholder=""
      />
      <LabeledTextField type="number" name="index" label="Index und Reihenfolge" placeholder="" />
      <LabeledTextField type="text" name="title" label="Name" placeholder="" />
      <LabeledTextField type="text" name="subTitle" label="Untertitel" optional placeholder="" />
      <LabeledTextareaField
        name="description"
        label="Beschreibung (Markdown)"
        placeholder=""
        optional
      />
      <LabeledTextField type="text" name="length" label="Länge (in km)" optional placeholder="" />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={users.map((u) => [String(u.id), getFullname(u)!])}
      />
    </Form>
  )
}
