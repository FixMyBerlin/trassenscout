import { checkProjectMemberRole } from "@/src/app/(loggedInProjects)/_utils/checkProjectMemberRole"
import { editorRoles } from "@/src/authorization/constants"
import { invoke } from "@/src/blitz-server"
import getProjectRecordsTabCounts from "@/src/server/projectRecords/queries/getProjectRecordsTabCounts"
import { Route } from "next"
import "server-only"

/**
 * Creates the tabs configuration for project records pages.
 * @param projectSlug - The project slug
 * @returns Array of tab configurations
 */
export async function getProjectRecordsTabs(projectSlug: string) {
  const canEdit = await checkProjectMemberRole(projectSlug, editorRoles)
  const { approvedCount, needsReviewCount } = await invoke(getProjectRecordsTabCounts, {
    projectSlug,
  })

  return [
    {
      name: `Protokolleinträge (${approvedCount})`,
      href: `/${projectSlug}/project-records` as Route,
    },
    ...(canEdit
      ? [
          {
            name: `Bestätigung erforderlich (${needsReviewCount})`,
            href: `/${projectSlug}/project-records/needreview` as Route,
          },
        ]
      : []),
  ]
}
