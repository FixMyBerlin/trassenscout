import { membershipRoles } from "@/src/authorization/constants"
import { Form, FORM_ERROR, FormProps, LabeledRadiobuttonGroup } from "@/src/core/components/forms"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { roleTranslation } from "@/src/pagesComponents/memberships/roleTranslation.const"
import updateMembershipRole from "@/src/server/memberships/mutations/updateMembershipRole"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import { getQueryClient, getQueryKey, useMutation } from "@blitzjs/rpc"
import { MembershipRoleEnum } from "@prisma/client"
import { z } from "zod"

type Props = {
  editUser: Awaited<ReturnType<typeof getProjectUsers>>[number]
  closeModal: () => void
}

const submitSchema = z.object({ role: z.nativeEnum(MembershipRoleEnum) })

type HandleSubmit = z.infer<typeof submitSchema>
export const TeamTableEditMembershipModalForm = ({ editUser, closeModal }: Props) => {
  const projectSlug = useProjectSlug()

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
    />
  )
}

const TeamTableEditMembershipModalFormFields = <S extends z.ZodType<any, any>>({
  editUserRole,
  ...props
}: FormProps<S> & { editUserRole: MembershipRoleEnum }) => {
  return (
    <Form<S> className="max-w-prose" {...props}>
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
