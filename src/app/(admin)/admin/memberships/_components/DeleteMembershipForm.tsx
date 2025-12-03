"use client"
import { linkIcons, linkStyles } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text"
import deleteMembership from "@/src/server/memberships/mutations/deleteMembership"
import getUsersAndMemberships from "@/src/server/users/queries/getUsersAndMemberships"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"

type Props = {
  membership: Awaited<
    ReturnType<typeof getUsersAndMemberships>
  >["users"][number]["memberships"][number]
}

export const DeleteMembershipForm = ({ membership }: Props) => {
  const router = useRouter()

  const [deleteMembershipMutation] = useMutation(deleteMembership)
  const handleDelete = async (membership: Props["membership"]) => {
    if (
      window.confirm(
        `Den Eintrag mit ID ${membership.id} auf Projekt ${shortTitle(
          membership.project.slug,
        )} unwiderruflich löschen?`,
      )
    ) {
      try {
        await deleteMembershipMutation({
          projectSlug: membership.project.slug,
          membershipId: membership.id,
        })
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      router.refresh()
    }
  }

  return (
    <button onClick={() => handleDelete(membership)} className={linkStyles}>
      {linkIcons["delete"]}
    </button>
  )
}
