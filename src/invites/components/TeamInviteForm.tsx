import { membershipRoles } from "@/src/authorization/constants"
import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledTextField,
} from "@/src/core/components/forms"
import { roleTranslation } from "@/src/memberships/components/roleTranslation.const"
import { z } from "zod"
export { FORM_ERROR } from "@/src/core/components/forms"

export function TeamInviteForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> className="max-w-prose" {...props}>
      <LabeledTextField type="text" name="email" label="E-Mail-Adresse" placeholder="" />
      <LabeledRadiobuttonGroup
        scope="role"
        label="Rechte"
        items={membershipRoles.map((role) => {
          return {
            scope: role,
            value: role,
            label: roleTranslation[role],
            defaultChecked: role === "VIEWER",
          }
        })}
      />
    </Form>
  )
}
