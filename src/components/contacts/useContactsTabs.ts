import { getRouteApi } from "@tanstack/react-router"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export function useContactsTabs() {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { edit } = useUserCan()

  const tabs: { name: string; to: string }[] = [
    { name: "Projektteam", to: `/${projectSlug}/contacts/team` },
  ]
  if (edit) {
    tabs.push({ name: "Einladungen", to: `/${projectSlug}/invites` })
  }
  tabs.push({ name: "Externe Kontakte", to: `/${projectSlug}/contacts` })
  return tabs
}
