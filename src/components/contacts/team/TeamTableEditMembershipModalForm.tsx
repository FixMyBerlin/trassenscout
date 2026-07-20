import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { FormDirtyStateReporter } from "@/src/components/core/components/forms/FormDirtyStateReporter"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import { membershipRoles } from "@/src/server/authorization/constants"
import { updateProjectMembershipRoleFn } from "@/src/server/memberships/memberships.functions"
import type { ProjectUser } from "@/src/server/memberships/types"
import { MembershipSchema } from "@/src/shared/memberships/schemas"
import { updateMembershipRoleFormDefaultValues } from "@/src/shared/memberships/schemas"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  editUser: ProjectUser
  closeModal: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

const submitSchema = z.object({ role: MembershipSchema.shape.role })

type HandleSubmit = z.infer<typeof submitSchema>

export const TeamTableEditMembershipModalForm = ({
  editUser,
  closeModal,
  onDirtyChange,
}: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const queryClient = useQueryClient()
  const updateUserMutation = useMutation({ mutationFn: updateProjectMembershipRoleFn })
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      ...updateMembershipRoleFormDefaultValues,
      role: editUser.currentMembershipRole,
    },
    validators: { onSubmit: submitSchema } as never,
    onSubmit: async ({ value }) => {
      try {
        await updateUserMutation.mutateAsync({
          data: {
            projectSlug,
            membershipId: editUser.currentMembershipId,
            role: (value as HandleSubmit).role,
          },
        })
        await queryClient.invalidateQueries({ queryKey: ["projectUsers", { projectSlug }] })
        closeModal()
      } catch (error: unknown) {
        console.error(error)
        applyFormSubmitResult(form, { [FORM_ERROR]: String(error) }, setFormError)
      }
    },
  })

  const roleItems = membershipRoles.map((role) => ({
    value: role,
    label: roleTranslation[role],
  }))

  return (
    <FormShell form={form} formError={formError} submitText="Speichern" withPagePadding={false}>
      <FormDirtyStateReporter onDirtyChange={onDirtyChange} />
      <form.AppField name="role">
        {(field) => <field.RadiobuttonGroup label="Rolle" items={roleItems} />}
      </form.AppField>
    </FormShell>
  )
}
