import { User } from "@prisma/client"
import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function ProjectForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & { users: User[] }
) {
  const { users } = props
  const currentUser = useCurrentUser()
  const userOptions = [
    [
      currentUser!.id.toString(),
      [currentUser!.firstName, currentUser!.lastName, `<${currentUser!.email}>`].join(" "),
    ],
  ].concat(
    users
      .filter((u) => u.id !== currentUser?.id)
      .map((u) => [String(u.id), [u.firstName, u.lastName, `<${u.email}>`].join(" ")])
  )

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
      <LabeledTextField type="text" name="shortTitle" label="Kurzname" placeholder="" optional />
      <LabeledTextareaField
        name="description"
        label="Beschreibung (Markdown)"
        placeholder=""
        optional
      />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        options={userOptions as [string, string][]}
        // TODO: type
      />
    </Form>
  )
}
