import { useQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { PageHeaderSearchFilter } from "@/src/components/core/components/PageHeader/PageHeaderSearchFilter"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters"
import { DashboardUploadsFeed } from "@/src/components/dashboard/DashboardUploadsFeed"
import { useDashboardTabs } from "@/src/components/dashboard/useDashboardTabs"
import { TagFilterCombobox } from "@/src/components/tags/TagFilterCombobox"
import { useTagFilterOptions } from "@/src/components/tags/useTagFilterOptions"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { myUploadTagsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"
import { mergeDashboardSearch } from "@/src/shared/dashboard/mergeDashboardSearch"
import type { DashboardUploadsSearch } from "@/src/shared/dashboard/searchSchemas"
import {
  DASHBOARD_ALL_MONTHS,
  DASHBOARD_ALL_PROJECTS,
  DASHBOARD_UPLOADS_RESET,
  dashboardFilterValues,
  hasDashboardUploadsFilter,
} from "@/src/shared/dashboard/searchSchemas"

const routeApi = getRouteApi("/_loggedInGeneral/dashboard/uploads/")

export function PageDashboardUploads() {
  const tabs = useDashboardTabs()
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: "/dashboard/uploads/" })
  const { data: projects = [] } = useQuery(projectsWithGeometryWithMembershipRoleQueryOptions())
  const filter = dashboardFilterValues(search)
  const { data: uploadTags } = useQuery(
    myUploadTagsQueryOptions({ projectSlug: filter.projectSlug }),
  )
  const tagOptions = useTagFilterOptions(uploadTags ? [uploadTags] : [], filter.projectSlug)
  const searchterm = search.searchterm ?? ""

  const updateSearch = (updates: Partial<DashboardUploadsSearch>) =>
    void navigate({
      search: (prev) => ({ ...prev, ...updates }),
      ...preserveScrollNavigateOptions,
    })

  const resetFilters = () =>
    void navigate({
      search: (prev) => ({
        ...mergeDashboardSearch(prev, {
          projectSlug: DASHBOARD_ALL_PROJECTS,
          months: DASHBOARD_ALL_MONTHS,
        }),
        ...DASHBOARD_UPLOADS_RESET,
      }),
      ...preserveScrollNavigateOptions,
    })

  return (
    <>
      <PageHeader
        title="Dokumente"
        titleVisuallyHidden
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbStep>Meine Projekte</BreadcrumbStep>
          </Breadcrumb>
        }
        info="Alle Dokumente aus den Projekten, in denen Sie mitarbeiten – neueste zuerst."
        tabs={<TabsApp tabs={tabs} embedded />}
        filters={
          <DashboardFilters
            projectSlug={search.projectSlug}
            months={search.months}
            projects={projects}
            onChange={(next) =>
              void navigate({
                search: (prev) => mergeDashboardSearch(prev, next),
                ...preserveScrollNavigateOptions,
              })
            }
            hasAdditionalFilters={hasDashboardUploadsFilter(search)}
            onReset={resetFilters}
          >
            <PageHeaderSearchFilter
              value={searchterm}
              onChange={(next) => updateSearch({ searchterm: next || undefined })}
              placeholder="Titel und Inhalte durchsuchen"
            />
            <TagFilterCombobox
              tags={tagOptions}
              value={search.tag}
              onChange={(tag) => updateSearch({ tag })}
            />
          </DashboardFilters>
        }
      />
      <DashboardUploadsFeed
        projectSlug={filter.projectSlug}
        searchterm={normalizeSearchterm(searchterm) || undefined}
        tag={search.tag}
        isFiltered={Boolean(filter.projectSlug) || hasDashboardUploadsFilter(search)}
        onResetFilters={resetFilters}
        onTagClick={(tag) => updateSearch({ tag })}
      />
    </>
  )
}
