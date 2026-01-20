import { checkProjectMemberRole } from "@/src/app/(loggedInProjects)/_utils/checkProjectMemberRole"
import { editorRoles } from "@/src/authorization/constants"
import { Route } from "next"
import "server-only"

/**
 * Creates the tabs configuration for contacts/team/invites pages.
 * @param projectSlug - The project slug
 * @returns Array of tab configurations
 */
export async function getContactsTabs(projectSlug: string) {
  const canEdit = await checkProjectMemberRole(projectSlug, editorRoles)

  return [
    {
      name: "Externe Kontakte",
      href: `/${projectSlug}/contacts` as Route,
    },
    {
      name: "Projektteam",
      href: `/${projectSlug}/contacts/team` as Route,
    },
    ...(canEdit
      ? [
          {
            name: "Einladungen",
            href: `/${projectSlug}/invites` as Route,
          },
        ]
      : []),
  ]
}
