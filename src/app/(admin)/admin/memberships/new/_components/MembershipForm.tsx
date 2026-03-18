"use client"
import { getProjectSelectOptions } from "@/src/app/(loggedInProjects)/_utils/getProjectSelectOptions"
import { roleTranslation } from "@/src/app/_components/memberships/roleTranslation.const"
import { getUserSelectOptions } from "@/src/app/_components/users/utils/getUserSelectOptions"
import { membershipRoles } from "@/src/authorization/constants"
import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledSelect,
} from "@/src/core/components/forms"
import getProjects from "@/src/server/projects/queries/getProjects"
import getUsers from "@/src/server/users/queries/getUsers"
import { useQuery } from "@blitzjs/rpc"
import { z } from "zod"

export function MembershipForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const [{ users }] = useQuery(getUsers, {})
  const [{ projects }] = useQuery(getProjects, {})

  return (
    <Form<S> {...props}>
      {(form) => (
        <>
          <LabeledSelect
            form={form}
            name="userId"
            label="User"
            options={getUserSelectOptions(users)}
          />
          <LabeledRadiobuttonGroup
            form={form}
            scope="role"
            label="Rechte"
            items={membershipRoles.map((role) => ({
              value: String(role),
              label: roleTranslation[role],
            }))}
          />
          <LabeledSelect
            form={form}
            name="projectId"
            label="Projekt, auf dem User Rechte erhalten soll"
            options={getProjectSelectOptions(projects)}
          />
        </>
      )}
    </Form>
  )
}
