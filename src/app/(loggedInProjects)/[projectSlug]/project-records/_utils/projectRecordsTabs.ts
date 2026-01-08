import { checkProjectMemberRole } from "@/src/app/(loggedInProjects)/_utils/checkProjectMemberRole"
import { editorRoles } from "@/src/authorization/constants"
import { Route } from "next"
import "server-only"

/**
 * Creates the tabs configuration for project records pages.
 * @param projectSlug - The project slug
 * @returns Array of tab configurations
 */
export async function getProjectRecordsTabs(projectSlug: string) {
  const canEdit = await checkProjectMemberRole(projectSlug, editorRoles)

  return [
    {
      name: "Protokolleinträge",
      href: `/${projectSlug}/project-records` as Route,
    },
    ...(canEdit
      ? [
          {
            name: "Bestätigung erforderlich",
            href: `/${projectSlug}/project-records/needsreview` as Route,
          },
        ]
      : []),
  ]
}
