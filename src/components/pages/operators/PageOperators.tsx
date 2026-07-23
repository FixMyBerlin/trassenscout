import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLinkSection } from "@/src/components/core/components/forms/BackLinkSection"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { OperatorsTable } from "@/src/components/operators/OperatorsTable"
import { useOperatorRouteLinks } from "@/src/components/operators/useOperatorActions"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { operatorsPaginatedQueryOptions } from "@/src/server/operators/operatorsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/operators/")

export function PageOperators() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const { page, pageSize } = routeApi.useSearch()
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useOperatorRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(operatorsPaginatedQueryOptions({ projectSlug, page, pageSize }))

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Baulastträger" />}
        primaryAction={
          canEdit ? (
            <Link button="blue" icon="plus" {...newLink}>
              Neuer Baulastträger
            </Link>
          ) : undefined
        }
      />
      <OperatorsTable operators={data.rows} pagination={data} />
      <IfUserCanEdit>
        {fromPath ? (
          <BackLinkSection>
            <ConditionalBackLink fromPath={fromPath} />
          </BackLinkSection>
        ) : null}
      </IfUserCanEdit>
      <div className={pageContentPaddingClassName}>
        <SuperAdminLogData data={{ operators: data.rows }} />
      </div>
    </>
  )
}
