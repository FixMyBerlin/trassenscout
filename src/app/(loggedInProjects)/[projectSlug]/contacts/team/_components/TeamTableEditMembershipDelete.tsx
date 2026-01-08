"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { linkIcons, linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import deleteMembership from "@/src/server/memberships/mutations/deleteMembership"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import { getQueryClient, getQueryKey, useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"

type Props = {
  membershipId: number
}

export const TeamTableEditMembershipDelete = ({ membershipId }: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const [deleteMembershipMutation] = useMutation(deleteMembership)
  const handleDelete = async () => {
    if (
      window.confirm(
        `Den Eintrag mit ID ${membershipId} auf diesem Projekt unwiderruflich löschen? Die Nutzer:in hat dann keinen Zugriff auf das Projekt mehr. Der Nutzer Account bleibt jedoch erhalten. Alle Daten und Änderungen der Nutzer:in bleiben ebenfalls erhalten.`,
      )
    ) {
      try {
        await deleteMembershipMutation(
          { projectSlug, membershipId },
          {
            onSuccess: async () => {
              const queryKey = getQueryKey(getProjectUsers, { projectSlug })
              void getQueryClient().invalidateQueries(queryKey)
              router.refresh()
            },
          },
        )
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
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
