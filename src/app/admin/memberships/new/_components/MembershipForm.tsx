"use client"
import { membershipRoles } from "@/src/authorization/constants"
import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledSelect,
} from "@/src/core/components/forms"
import { roleTranslation } from "@/src/pagesComponents/memberships/roleTranslation.const"
import { getProjectSelectOptions } from "@/src/pagesComponents/projects/utils/getProjectSelectOptions"
import { getUserSelectOptions } from "@/src/pagesComponents/users/utils/getUserSelectOptions"
import getProjects from "@/src/server/projects/queries/getProjects"
import getUsers from "@/src/server/users/queries/getUsers"
import { useQuery } from "@blitzjs/rpc"
import { z } from "zod"

export function MembershipForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const [{ users }] = useQuery(getUsers, {})
  const [{ projects }] = useQuery(getProjects, {})

  return (
    <Form<S> {...props}>
      <LabeledSelect name="userId" label="User" options={getUserSelectOptions(users)} />
      <LabeledRadiobuttonGroup
        scope="role"
        label="Rechte"
        items={membershipRoles.map((role) => {
          return {
            scope: role,
            value: role,
            label: roleTranslation[role],
            defaultChecked: role === "EDITOR",
          }
        })}
      />
      <LabeledSelect
        name="projectId"
        label="Projekt, auf dem User Rechte erhalten soll"
        options={getProjectSelectOptions(projects)}
      />
    </Form>
  )
}
