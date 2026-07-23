import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { AcquisitionAreaStatusesTable } from "@/src/components/acquisition-area-status/AcquisitionAreaStatusesTable"
import { useAcquisitionAreaStatusRouteLinks } from "@/src/components/acquisition-area-status/useAcquisitionAreaStatusActions"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLinkSection } from "@/src/components/core/components/forms/BackLinkSection"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/acquisition-area-status/")

export function PageAcquisitionAreaStatus() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useAcquisitionAreaStatusRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({
      projectSlug,
      table: "acquisitionAreaStatuses",
    }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Flächenerwerb-Status" />}
        primaryAction={
          canEdit ? (
            <Link button="blue" icon="plus" {...newLink}>
              Neuer Status
            </Link>
          ) : undefined
        }
      />
      <AcquisitionAreaStatusesTable acquisitionAreaStatuses={rows} />
      <IfUserCanEdit>
        {fromPath ? (
          <BackLinkSection>
            <ConditionalBackLink fromPath={fromPath} />
          </BackLinkSection>
        ) : null}
      </IfUserCanEdit>
      <div className={pageContentPaddingClassName}>
        <SuperAdminLogData data={{ acquisitionAreaStatuses: rows }} />
      </div>
    </>
  )
}
