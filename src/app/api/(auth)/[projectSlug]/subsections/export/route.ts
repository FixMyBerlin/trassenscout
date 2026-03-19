import db from "@/db"
import {
  subsubsectionCsvResponse,
  subsubsectionExportFilename,
  subsubsectionExportInclude,
  subsubsectionsToCsvString,
} from "@/src/app/api/(auth)/[projectSlug]/subsections/_utils/subsubsectionExport"
import { withProjectMembership } from "@/src/app/api/(auth)/_utils/withProjectMembership"
import { viewerRoles } from "@/src/authorization/constants"

export const GET = withProjectMembership(viewerRoles, async ({ params }) => {
  const { projectSlug } = params

  const subsubsections = await db.subsubsection.findMany({
    where: {
      subsection: {
        project: { slug: projectSlug },
      },
    },
    include: subsubsectionExportInclude,
    orderBy: [{ subsection: { slug: "asc" } }, { slug: "asc" }],
  })

  const csvString = subsubsectionsToCsvString(subsubsections, projectSlug)
  const filename = subsubsectionExportFilename(projectSlug /* no subsectionSlug = project-level */)

  return subsubsectionCsvResponse(csvString, filename)
})
