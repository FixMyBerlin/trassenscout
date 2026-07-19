import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { H3 } from "@/src/components/core/components/text/Headings"
import { DeleteProjectRecordWithUploadsClient } from "@/src/components/project-records/DeleteProjectRecordWithUploadsClient"
import { projectRecordDeleteInfoQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/project-records/$projectRecordId/delete/",
)

export function PageProjectRecordDelete() {
  const { projectSlug, projectRecordId } = routeApi.useParams()
  const id = Number(projectRecordId)
  const { data: deleteInfo } = useSuspenseQuery(
    projectRecordDeleteInfoQueryOptions({ projectSlug, id }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Projektprotokoll"
            sectionTo="/$projectSlug/project-records"
            current="Protokolleintrag löschen"
          />
        }
        title="Protokolleintrag und verknüpfte Dokumente löschen"
      />
      <div className="mb-8 max-w-3xl">
        <H3>Verknüpfte Dokumente</H3>
        <p>
          Der Protokolleintrag <em>{deleteInfo.projectRecord.title}</em> hat{" "}
          {deleteInfo.uploads.length} verknüpfte Dokument
          {deleteInfo.uploads.length !== 1 ? "e" : ""}.
        </p>
        <p>
          Entscheiden Sie für jedes Dokument, ob es zusammen mit dem Protokolleintrag gelöscht oder
          unabhängig vom Protokolleintrag gespeichert werden soll. Beachten Sie, dass Dokumente auch
          mit weitere Verknüpfungen haben können.
        </p>
      </div>
      <DeleteProjectRecordWithUploadsClient deleteInfo={deleteInfo} projectSlug={projectSlug} />
    </>
  )
}
