import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { deleteProjectMembershipFn } from "@/src/server/memberships/memberships.functions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  membershipId: number
}

export const TeamTableEditMembershipDelete = ({ membershipId }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const queryClient = useQueryClient()
  const deleteMembershipMutation = useMutation({ mutationFn: deleteProjectMembershipFn })

  const handleDelete = async () => {
    if (
      window.confirm(
        `Den Eintrag mit ID ${membershipId} auf diesem Projekt unwiderruflich löschen? Die Nutzer:in hat dann keinen Zugriff auf das Projekt mehr. Der Nutzer Account bleibt jedoch erhalten. Alle Daten und Änderungen der Nutzer:in bleiben ebenfalls erhalten.`,
      )
    ) {
      try {
        await deleteMembershipMutation.mutateAsync({ data: { projectSlug, membershipId } })
        await queryClient.invalidateQueries({ queryKey: ["projectUsers", { projectSlug }] })
      } catch {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return (
    <IfUserCanEdit>
      <button
        onClick={() => void handleDelete()}
        className={linkStyles}
        title="Mitgliedschaft im Projekt löschen"
      >
        {linkIcons["delete"]}
      </button>
    </IfUserCanEdit>
  )
}
