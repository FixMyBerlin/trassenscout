import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { LabeledGeometryField } from "src/core/components/forms/LabeledGeometryField"
import { getFullname } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function SubsectionForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & {
    users: { id: number; firstName: string | null; lastName: string | null; email: string }[]
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
      <LabeledTextField type="text" name="title" label="Name" placeholder="" />
      <LabeledTextareaField
        name="description"
        label="Beschreibung (Markdown)"
        placeholder=""
        optional
      />
      <LabeledGeometryField name="geometry" label="Geometry (LineString)" placeholder="" />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={users.map((u) => [u.id.toString(), [getFullname(u), `<${u.email}>`].join(" ")])}
      />
    </Form>
  )
}
