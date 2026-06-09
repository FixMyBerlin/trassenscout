"use client"

import { roleTranslation } from "@/src/app/_components/memberships/roleTranslation.const"
import { membershipRoles } from "@/src/authorization/constants"
import { FormDirtyStateReporter } from "@/src/core/components/forms/FormDirtyStateReporter"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import updateMembershipRole from "@/src/server/memberships/mutations/updateMembershipRole"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import {
  membershipRoleFormDefaultValues,
  MembershipRoleFormSchema,
} from "@/src/server/memberships/schema"
import { getQueryClient, getQueryKey, useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

type Props = {
  editUser: Awaited<ReturnType<typeof getProjectUsers>>[number]
  closeModal: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

type HandleSubmit = z.infer<typeof MembershipRoleFormSchema>

export const TeamTableEditMembershipModalForm = ({
  editUser,
  closeModal,
  onDirtyChange,
}: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const [updateUserMutation] = useMutation(updateMembershipRole)

  const form = useAppForm({
    defaultValues: {
      ...membershipRoleFormDefaultValues,
      role: editUser.currentMembershipRole,
    },
    validators: { onSubmit: MembershipRoleFormSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateUserMutation(
          {
            projectSlug,
            membershipId: editUser.currentMembershipId,
            role: value.role,
          },
          {
            onSuccess: async () => {
              const queryKey = getQueryKey(getProjectUsers, { projectSlug })
              void getQueryClient().invalidateQueries(queryKey)
              router.refresh()
              closeModal()
            },
          },
        )
      } catch (error: any) {
        console.error(error)
        applyFormSubmitResult(form, { [FORM_ERROR]: error }, setFormError)
      }
    },
  })

  const roleItems = membershipRoles.map((role) => ({
    value: role,
    label: roleTranslation[role],
  }))

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText="Speichern"
      className={twMerge("max-w-prose")}
    >
      <FormDirtyStateReporter onDirtyChange={onDirtyChange} />
      <form.AppField name="role">
        {(field) => <field.RadiobuttonGroup label="Rechte" items={roleItems} />}
      </form.AppField>
    </FormShell>
  )
}
