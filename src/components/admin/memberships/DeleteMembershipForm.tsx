import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminTableDeleteButton } from "@/src/components/admin/AdminTableActions"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { deleteProjectMembershipFn } from "@/src/server/memberships/memberships.functions"
import { usersWithMembershipsQueryOptions } from "@/src/server/users/usersQueryOptions"
type Props = {
  membership: {
    id: number
    project: {
      slug: string
    }
  }
}

export const DeleteMembershipForm = ({ membership }: Props) => {
  const queryClient = useQueryClient()
  const deleteMembershipMutation = useMutation({ mutationFn: deleteProjectMembershipFn })

  const handleDelete = async (membershipToDelete: Props["membership"]) => {
    if (
      window.confirm(
        `Den Eintrag mit ID ${membershipToDelete.id} auf Projekt ${shortTitle(
          membershipToDelete.project.slug,
        )} unwiderruflich löschen?`,
      )
    ) {
      try {
        await deleteMembershipMutation.mutateAsync({
          data: {
            projectSlug: membershipToDelete.project.slug,
            membershipId: membershipToDelete.id,
          },
        })
        await queryClient.invalidateQueries({
          queryKey: usersWithMembershipsQueryOptions().queryKey,
        })
      } catch {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return <AdminTableDeleteButton onClick={() => handleDelete(membership)} />
}
