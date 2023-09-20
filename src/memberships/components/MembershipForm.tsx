import { Project, User } from "@prisma/client"
import { Form, FormProps, LabeledSelect } from "src/core/components/forms"
import { getProjectSelectOptions } from "src/projects/utils/getProjectSelectOptions"
import { UserSelectOptions, getUserSelectOptions } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function MembershipForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & { projects: Partial<Project>[] } & { users: UserSelectOptions },
) {
  const { projects, users } = props
  console.log(projects)
  return (
    <Form<S> {...props}>
      <LabeledSelect name="userId" label="User" options={getUserSelectOptions(users)} />
      <LabeledSelect
        name="projectId"
        label="Projekt, auf dem User Rechte erhalten soll"
        options={getProjectSelectOptions(projects)}
      />
    </Form>
  )
}
