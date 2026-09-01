import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
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
        `Möchtest du den Zugriff auf dieses Projekt für diese:n Nutzer:in (ID ${membershipId}) unwiderruflich löschen?\nZugriff: Die Nutzer:in verliert den Zugriff auf dieses Projekt.\nDatenschutz: Die personenbezogenen Kontoinformationen werden im System anonymisiert.\nDatenbestand: Alle bisher getätigten Eingaben und Änderungen bleiben im Projekt erhalten.`,
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
        type="button"
        onClick={() => void handleDelete()}
        className={twJoin(
          "inline-flex cursor-pointer items-center justify-center gap-1",
          linkStyles,
        )}
      >
        {linkIcons["delete"]}
        Löschen
      </button>
    </IfUserCanEdit>
  )
}
