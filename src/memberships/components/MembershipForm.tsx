import { useQuery } from "@blitzjs/rpc"
import { Form, FormProps, LabeledSelect } from "src/core/components/forms"
import getProjects from "src/projects/queries/getProjects"
import { getProjectSelectOptions } from "src/projects/utils/getProjectSelectOptions"
import getUsers from "src/users/queries/getUsers"
import { getUserSelectOptions } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function MembershipForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const [{ users }] = useQuery(getUsers, {})
  const [{ projects }] = useQuery(getProjects, {})

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
