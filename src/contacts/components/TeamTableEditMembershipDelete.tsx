import { linkIcons, linkStyles } from "@/src/core/components/links"
import { useSlugs } from "@/src/core/hooks"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import deleteMembership from "@/src/memberships/mutations/deleteMembership"
import getProjectUsers from "@/src/memberships/queries/getProjectUsers"
import { getQueryClient, getQueryKey, useMutation } from "@blitzjs/rpc"

type Props = {
  membershipId: number
}

export const TeamTableEditMembershipDelete = ({ membershipId }: Props) => {
  const { projectSlug } = useSlugs()

  const [deleteMembershipMutation] = useMutation(deleteMembership)
  const handleDelete = async () => {
    if (
      window.confirm(
        `Den Eintrag mit ID ${membershipId} auf diesem Projekt unwiderruflich löschen? Die Nutzer:in hat dann keinen Zugriff auf das Projekt mehr. Der Nutzer Account bleibt jedoch erhalten. Alle Daten und Änderungen der Nutzer:in bleiben ebenfalls erhalten.`,
      )
    ) {
      await deleteMembershipMutation(
        { id: membershipId },
        {
          onSuccess: async () => {
            const queryKey = getQueryKey(getProjectUsers, { projectSlug: projectSlug! })
            void getQueryClient().invalidateQueries(queryKey)
          },
        },
      )
    }
  }

  return (
    <IfUserCanEdit>
      <button
        onClick={() => handleDelete()}
        className={linkStyles}
        title="Mitgliedschaft im Projekt löschen"
      >
        {linkIcons["delete"]}
      </button>
    </IfUserCanEdit>
  )
}
