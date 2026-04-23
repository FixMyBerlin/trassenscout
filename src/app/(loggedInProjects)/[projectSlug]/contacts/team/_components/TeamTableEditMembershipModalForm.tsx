import { roleTranslation } from "@/src/app/_components/memberships/roleTranslation.const"
import { membershipRoles } from "@/src/authorization/constants"
import {
  Form,
  FORM_ERROR,
  FormDirtyStateReporter,
  FormProps,
  LabeledRadiobuttonGroup,
} from "@/src/core/components/forms"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import updateMembershipRole from "@/src/server/memberships/mutations/updateMembershipRole"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import { getQueryClient, getQueryKey, useMutation } from "@blitzjs/rpc"
import { MembershipRoleEnum } from "@prisma/client"
import { useRouter } from "next/navigation"
import { z } from "zod"

type Props = {
  editUser: Awaited<ReturnType<typeof getProjectUsers>>[number]
  closeModal: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

const submitSchema = z.object({ role: z.nativeEnum(MembershipRoleEnum) })

type HandleSubmit = z.infer<typeof submitSchema>
export const TeamTableEditMembershipModalForm = ({ editUser, closeModal, onDirtyChange }: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()

  const [updateUserMutation] = useMutation(updateMembershipRole)
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateUserMutation(
        {
          projectSlug,
          membershipId: editUser.currentMembershipId,
          role: values.role,
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
      return { [FORM_ERROR]: error }
    }
  }
  return (
    <TeamTableEditMembershipModalFormFields
      submitText="Speichern"
      schema={submitSchema}
      initialValues={{ role: editUser.currentMembershipRole }}
      onSubmit={handleSubmit}
      editUserRole={editUser.currentMembershipRole}
      onDirtyChange={onDirtyChange}
    />
  )
}

const TeamTableEditMembershipModalFormFields = <S extends z.ZodType<any, any>>({
  editUserRole,
  onDirtyChange,
  ...props
}: FormProps<S> & {
  editUserRole: MembershipRoleEnum
  onDirtyChange?: (isDirty: boolean) => void
}) => {
  return (
    <Form<S> className="max-w-prose" {...props}>
      <FormDirtyStateReporter onDirtyChange={onDirtyChange} />
      <LabeledRadiobuttonGroup
        scope="role"
        label="Rechte"
        items={membershipRoles.map((role) => {
          return {
            scope: role,
            value: role,
            label: roleTranslation[role],
            defaultChecked: role === editUserRole,
          }
        })}
      />
    </Form>
  )
}
