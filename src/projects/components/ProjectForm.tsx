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

export function ProjectForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & {
    users: {
      id: number
      firstName: string | null
      lastName: string | null
      email: string
    }[]
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
      <LabeledTextField type="text" name="shortTitle" label="Kurzname" placeholder="" />
      <LabeledTextField
        optional
        type="text"
        name="logoSrc"
        label="Logo"
        placeholder="beispiel.png"
        help="Das Logo wird von FixMyCity extern abgelegt und hier referenziert."
      />
      <LabeledTextareaField
        name="description"
        label="Beschreibung (Markdown)"
        placeholder=""
        optional
      />
      <LabeledTextareaField
        optional
        name="partnerLogoSrc"
        help="Die Logos werden von FixMyCity extern abgelegt und hier referenziert."
        label="Partner-Logos (ein Logo pro Zeile)"
        placeholder="beispiel.png"
      />

      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={users.map((u) => [u.id.toString(), [getFullname(u), `<${u.email}>`].join(" ")])}
      />
    </Form>
  )
}
