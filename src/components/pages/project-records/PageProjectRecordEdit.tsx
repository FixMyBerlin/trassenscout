import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { EditProjectRecordForm } from "@/src/components/project-records/EditProjectRecordForm"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { projectRecordMcpDraftQueryOptions } from "@/src/server/mcp/mcpDrafts/mcpDraftsQueryOptions"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { isMcpDraftSearch } from "@/src/shared/mcp/catalogMcpSearch"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/project-records/$projectRecordId/edit/",
)
const recordsRouteApi = getRouteApi("/_loggedInProjects/$projectSlug/project-records")

export function PageProjectRecordEdit() {
  const { projectSlug, projectRecordId } = routeApi.useParams()
  const id = Number(projectRecordId)
  const { mcpDraft } = recordsRouteApi.useSearch()
  const applyMcpDraft = isMcpDraftSearch(mcpDraft)
  const mcpDraftQuery = useQuery({
    ...projectRecordMcpDraftQueryOptions({ projectSlug, id }),
    enabled: applyMcpDraft,
  })
  const { data: projectRecord } = useSuspenseQuery(projectRecordQueryOptions({ projectSlug, id }))

  return (
    <>
      <PageHeader
        title="Protokolleintrag bearbeiten"
        titleVisuallyHidden
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Projektprotokoll"
            sectionTo="/$projectSlug/project-records"
            current="bearbeiten"
          />
        }
      />
      {applyMcpDraft && mcpDraftQuery.isPending ? (
        <p className="text-sm text-gray-600">MCP-Draft wird geladen…</p>
      ) : (
        <EditProjectRecordForm
          projectRecord={projectRecord}
          mcpOverlay={applyMcpDraft ? (mcpDraftQuery.data ?? null) : null}
        />
      )}
    </>
  )
}
