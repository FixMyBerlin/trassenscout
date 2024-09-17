import { membershipRoles } from "@/src/authorization/constants"
import { Form, FormProps, LabeledRadiobuttonGroup } from "@/src/core/components/forms"
import { useSlugs } from "@/src/core/hooks"
import { roleTranslation } from "@/src/memberships/components/roleTranslation.const"
import updateMembershipRole from "@/src/memberships/mutations/updateMembershipRole"
import getProjectUsers from "@/src/memberships/queries/getProjectUsers"
import { FORM_ERROR } from "@/src/projects/components/ProjectForm"
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
  const { projectSlug } = useSlugs()

  const [updateUserMutation] = useMutation(updateMembershipRole)
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateUserMutation(
        {
          membershipId: editUser.currentMembershipId,
          role: values.role,
        },
        {
          onSuccess: async () => {
            const queryKey = getQueryKey(getProjectUsers, { projectSlug: projectSlug! })
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
