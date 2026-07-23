import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
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
import { SubsubsectionInfrasTable } from "@/src/components/subsubsection-infra/SubsubsectionInfrasTable"
import { useSubsubsectionInfraRouteLinks } from "@/src/components/subsubsection-infra/useSubsubsectionInfraActions"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-infra/")

export function PageSubsubsectionInfra() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useSubsubsectionInfraRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({
      projectSlug,
      table: "subsubsectionInfras",
    }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Infrastruktur" />}
        primaryAction={
          canEdit ? (
            <Link button="blue" icon="plus" {...newLink}>
              Neue Infrastruktur
            </Link>
          ) : undefined
        }
      />
      <SubsubsectionInfrasTable subsubsectionInfras={rows} />
      <IfUserCanEdit>
        {fromPath ? (
          <BackLinkSection>
            <ConditionalBackLink fromPath={fromPath} />
          </BackLinkSection>
        ) : null}
      </IfUserCanEdit>
      <div className={pageContentPaddingClassName}>
        <SuperAdminLogData data={{ subsubsectionInfras: rows }} />
      </div>
    </>
  )
}
