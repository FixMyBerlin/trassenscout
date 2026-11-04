import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { MapProvider } from "react-map-gl/maplibre"
import { twJoin } from "tailwind-merge"
import { ProjectSubsectionMcpCreateDraftsAdminBox } from "@/src/components/abschnitte/ProjectSubsectionMcpCreateDraftsAdminBox"
import { SubsubsectionSearchFilter } from "@/src/components/abschnitte/SubsubsectionSearchFilter"
import { SubsubsectionSearchMapNotice } from "@/src/components/abschnitte/SubsubsectionSearchMapNotice"
import { useSubsubsectionSearch } from "@/src/components/abschnitte/useSubsubsectionSearch"
import {
  filterSubsubsections,
  subsubsectionMatchSummary,
} from "@/src/components/abschnitte/utils/filterSubsubsections"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { ProjectMap } from "@/src/components/core/components/Map/ProjectMap"
import { ProjectMapFallback } from "@/src/components/core/components/Map/ProjectMapFallback"
import { GeometryErrorNotice } from "@/src/components/core/components/Notice/GeometryErrorNotice"
import {
  MapListViewLayout,
  MAP_VIEWPORT_SHELL_CLASS,
} from "@/src/components/core/components/PageHeader/MapListViewLayout"
import { optionalPageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { PageHeaderToolbarLink } from "@/src/components/core/components/PageHeader/PageHeaderToolbarLink"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { preserveScrollNavigateOptions } from "@/src/components/core/routes/preserveScrollNavigateOptions"
import { useViewMode } from "@/src/components/core/routes/useViewMode"
import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { brokenGeometryItems } from "@/src/shared/geometry/brokenGeometryItems"
import { OperatorFilter } from "./OperatorFilter"
import { ProjectSubsubsectionSearchResults } from "./ProjectSubsubsectionSearchResults"
import { SubsectionTable } from "./SubsectionTable"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/")

export const ProjectDashboardClient = () => {
  const { projectSlug } = routeApi.useParams()
  const { operator: operatorParam } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const { viewMode, setViewMode } = useViewMode()
  const { searchterm, isSearching } = useSubsubsectionSearch()
  const isMapMode = viewMode === "map"

  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const { data: subsections } = useSuspenseQuery(subsectionsQueryOptions({ projectSlug }))
  const showOperatorFilter = project.operators.length > 0 || Boolean(operatorParam)

  const filteredSubsections = operatorParam
    ? subsections.filter((sec) => sec.operator?.slug === operatorParam)
    : subsections
  const hasAnySubsubsections = subsections.some((s) => (s.subsubsectionCount ?? 0) > 0)

  // All Maßnahmen of the project load only with the first search.
  const { data: subsubsections } = useQuery({
    ...subsubsectionsQueryOptions({ projectSlug }),
    enabled: isSearching,
    throwOnError: true,
  })
  const filteredSubsectionIds = new Set(filteredSubsections.map((subsection) => subsection.id))
  const searchMatches =
    isSearching && subsubsections
      ? filterSubsubsections(subsubsections, searchterm).filter((subsubsection) =>
          filteredSubsectionIds.has(subsubsection.subsectionId),
        )
      : undefined
  const matchedSubsectionSlugs =
    searchMatches && new Set(searchMatches.map((subsubsection) => subsubsection.subsection.slug))

  const showSearchInList = (value: string) => {
    void navigate({
      search: (previous) => ({
        ...previous,
        searchterm: value || undefined,
        view: normalizeSearchterm(value) ? "list" : previous.view,
      }),
      resetScroll: false,
    })
  }

  const resetFilters = () => {
    void navigate({
      search: (previous) => ({ ...previous, operator: undefined, searchterm: undefined }),
      ...preserveScrollNavigateOptions,
    })
  }

  const renderMap = (classHeight: string) => {
    if (subsections.length) {
      if (filteredSubsections.length) {
        return (
          <MapProvider>
            <div className="relative flex min-h-0 flex-1 flex-col">
              {isSearching ? (
                <SubsubsectionSearchMapNotice
                  onShowList={searchMatches?.length ? () => setViewMode("list") : undefined}
                >
                  {!searchMatches || !matchedSubsectionSlugs
                    ? "Suche läuft…"
                    : searchMatches.length
                      ? subsubsectionMatchSummary(searchMatches.length, matchedSubsectionSlugs.size)
                      : "Keine passenden Maßnahmen"}
                </SubsubsectionSearchMapNotice>
              ) : null}
              <ProjectMap
                subsections={filteredSubsections}
                classHeight={classHeight}
                search={matchedSubsectionSlugs && { searchterm, matchedSubsectionSlugs }}
              />
            </div>
          </MapProvider>
        )
      }
      return <ProjectMapFallback subsections={subsections} classHeight={classHeight} />
    }
    return (
      <MapProvider>
        <ProjectMapFallback subsections={[]} classHeight={classHeight} />
      </MapProvider>
    )
  }

  return (
    <div className={twJoin(isMapMode && MAP_VIEWPORT_SHELL_CLASS)}>
      <PageHeader
        className={isMapMode ? "mb-0 shrink-0" : undefined}
        title={shortTitle(project.slug)}
        titleVisuallyHidden
        breadcrumb={<ProjectPageBreadcrumb />}
        info="Übersicht über alle Planungsabschnitte des Projekts."
        search={
          hasAnySubsubsections ? (
            <SubsubsectionSearchFilter
              placeholder="Maßnahmen nach Kürzel, Titel und Beschreibung suchen"
              resetLabel="Suche löschen"
              onSubmit={showSearchInList}
            />
          ) : undefined
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={showOperatorFilter ? <OperatorFilter /> : undefined}
        action={
          <IfUserCanEdit>
            <Link icon="edit" to="/$projectSlug/edit" params={{ projectSlug }}>
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
        primaryAction={
          <IfUserCanEdit>
            <>
              {hasAnySubsubsections ? (
                <PageHeaderToolbarLink
                  href={`/api/${projectSlug}/subsections/export`}
                  label="Alle Maßnahmen als .csv herunterladen"
                >
                  CSV
                </PageHeaderToolbarLink>
              ) : null}
              <Link
                button
                buttonSize="sm"
                icon="plus"
                to="/$projectSlug/abschnitte/new"
                params={{ projectSlug }}
              >
                Neuer Planungsabschnitt
              </Link>
            </>
          </IfUserCanEdit>
        }
      />

      <div className={optionalPageContentPaddingClassName}>
        <GeometryErrorNotice
          items={brokenGeometryItems(subsections)}
          labelSingular="Planungsabschnitt"
          labelPlural="Planungsabschnitte"
        />
      </div>

      <MapListViewLayout
        mode={viewMode}
        map={renderMap}
        list={({ interactive }) => {
          if (!isSearching) {
            return <SubsectionTable subsections={filteredSubsections} interactive={interactive} />
          }
          if (interactive) {
            return (
              <ProjectSubsubsectionSearchResults
                matches={searchMatches}
                searchterm={searchterm}
                onReset={resetFilters}
              />
            )
          }
          // Screen-reader list in map mode: the same Planungsabschnitte the map highlights.
          const subsectionsWithMatches = filteredSubsections.filter((subsection) =>
            matchedSubsectionSlugs?.has(subsection.slug),
          )
          return subsectionsWithMatches.length ? (
            <SubsectionTable subsections={subsectionsWithMatches} interactive={false} />
          ) : null
        }}
      >
        <ProjectSubsectionMcpCreateDraftsAdminBox projectSlug={projectSlug} />
        <SuperAdminBox className="flex flex-col items-start gap-4">
          <Link button icon="plus" to={`/admin/projects/${projectSlug}/subsections/multiple-new`}>
            Mehrere Planungsabschnitte erstellen
          </Link>
          <Link button to={`/admin/projects/${projectSlug}/subsections`}>
            Placemark Import für Planungsabschnitte
          </Link>
        </SuperAdminBox>
        <SuperAdminLogData data={{ project, subsections, filteredSubsections }} />
      </MapListViewLayout>
    </div>
  )
}
