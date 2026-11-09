import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { SubsectionMcpCreateDraftsAdminBox } from "@/src/components/abschnitte/SubsectionMcpCreateDraftsAdminBox"
import { SubsubsectionSearchFilter } from "@/src/components/abschnitte/SubsubsectionSearchFilter"
import { SubsubsectionSearchMapNotice } from "@/src/components/abschnitte/SubsubsectionSearchMapNotice"
import { useSubsubsectionSearch } from "@/src/components/abschnitte/useSubsubsectionSearch"
import { filterSubsubsections } from "@/src/components/abschnitte/utils/filterSubsubsections"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { SubsubsectionMapWithProvider } from "@/src/components/core/components/Map/SubsubsectionMapWithProvider"
import { GeometryErrorNotice } from "@/src/components/core/components/Notice/GeometryErrorNotice"
import {
  MapListViewLayout,
  MAP_VIEWPORT_SHELL_CLASS,
} from "@/src/components/core/components/PageHeader/MapListViewLayout"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { PageHeaderToolbarLink } from "@/src/components/core/components/PageHeader/PageHeaderToolbarLink"
import { FilteredZeroCase } from "@/src/components/core/components/text/FilteredZeroCase"
import { useViewMode } from "@/src/components/core/routes/useViewMode"
import { IfUserCanEdit } from "@/src/components/shared/memberships/IfUserCan"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import type { SubsectionsList } from "@/src/server/subsections/types"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { brokenGeometryItems } from "@/src/shared/geometry/brokenGeometryItems"
import { hasGeometry } from "@/src/shared/geometry/hasGeometry"
import { SubsubsectionTable } from "./SubsubsectionTable"

const subsectionRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/",
)

type Subsection = SubsectionsList[number]

function SubsectionDashboardContent({
  projectSlug,
  subsectionSlug,
  subsection,
  subsections,
}: {
  projectSlug: string
  subsectionSlug: string
  subsection: Subsection
  subsections: SubsectionsList
}) {
  const { viewMode, setViewMode } = useViewMode()
  const isMapMode = viewMode === "map"
  const { searchterm, isSearching, setSearchterm } = useSubsubsectionSearch()
  const { data: subsubsections } = useSuspenseQuery(
    subsubsectionsQueryOptions({ projectSlug, subsectionId: subsection.id }),
  )
  const filteredSubsubsections = filterSubsubsections(subsubsections, searchterm)
  const mapSubsubsections = filteredSubsubsections.filter(hasGeometry)
  const matchCountWithoutGeometry = filteredSubsubsections.length - mapSubsubsections.length

  return (
    <div className={twJoin(isMapMode && MAP_VIEWPORT_SHELL_CLASS)}>
      <PageHeader
        className={isMapMode ? "mb-0 shrink-0" : undefined}
        breadcrumb={<AbschnitteBreadcrumb />}
        info="Übersicht über alle Maßnahmen dieses Planungsabschnitts."
        search={
          subsubsections.length > 0 ? (
            <SubsubsectionSearchFilter placeholder="Maßnahmen nach Kürzel, Titel und Beschreibung filtern" />
          ) : undefined
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        action={
          <IfUserCanEdit>
            <Link
              icon="edit"
              to="/$projectSlug/abschnitte/$subsectionSlug/edit"
              params={{ projectSlug, subsectionSlug }}
            >
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
        primaryAction={
          <IfUserCanEdit>
            <>
              {subsubsections.length > 0 ? (
                <PageHeaderToolbarLink
                  href={`/api/${projectSlug}/subsections/${subsectionSlug}/subsubsections/export`}
                  label="Maßnahmen als .csv herunterladen"
                >
                  CSV
                </PageHeaderToolbarLink>
              ) : null}
              <Link
                button
                buttonSize="sm"
                icon="plus"
                to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/new"
                params={{ projectSlug, subsectionSlug }}
              >
                Neue Maßnahme
              </Link>
            </>
          </IfUserCanEdit>
        }
      />

      <SubsectionMcpCreateDraftsAdminBox
        className="mx-4 mb-2"
        projectSlug={projectSlug}
        subsectionSlug={subsectionSlug}
      />

      <div className="mx-4 shrink-0">
        <GeometryErrorNotice
          items={brokenGeometryItems(subsections)}
          labelSingular="Planungsabschnitt"
          labelPlural="Planungsabschnitte"
        />
        <GeometryErrorNotice
          items={brokenGeometryItems(subsubsections)}
          labelSingular="Maßnahme"
          labelPlural="Maßnahmen"
        />
      </div>

      <MapListViewLayout
        mode={viewMode}
        map={(classHeight) => (
          <div className="relative flex min-h-0 flex-1 flex-col">
            {isSearching && !filteredSubsubsections.length ? (
              <SubsubsectionSearchMapNotice>Keine passenden Maßnahmen</SubsubsectionSearchMapNotice>
            ) : null}
            {isSearching && matchCountWithoutGeometry > 0 ? (
              <SubsubsectionSearchMapNotice onShowList={() => setViewMode("list")}>
                {matchCountWithoutGeometry} Treffer ohne Geometrie
              </SubsubsectionSearchMapNotice>
            ) : null}
            <SubsubsectionMapWithProvider
              key="map-subsection"
              projectSlug={projectSlug}
              subsectionSlug={subsectionSlug}
              subsections={subsections}
              selectedSubsection={subsection}
              subsubsections={mapSubsubsections}
              clusterSubsubsections
              classHeight={classHeight}
            />
          </div>
        )}
        list={({ interactive }) => {
          if (isSearching && !filteredSubsubsections.length) {
            return interactive ? (
              <FilteredZeroCase name="Maßnahmen" onReset={() => setSearchterm("")} />
            ) : null
          }
          return (
            <SubsubsectionTable
              subsubsections={filteredSubsubsections}
              compact={false}
              interactive={interactive}
              searchterm={searchterm}
            />
          )
        }}
      >
        <SuperAdminLogData data={{ subsections, subsection, subsubsections }} />
      </MapListViewLayout>
    </div>
  )
}

export const SubsectionDashboardClient = () => {
  const { projectSlug, subsectionSlug } = subsectionRouteApi.useParams()
  const { data: subsections } = useSuspenseQuery(subsectionsQueryOptions({ projectSlug }))
  const subsection = subsections.find((ss) => ss.slug === subsectionSlug)

  if (!subsection) return null

  return (
    <SubsectionDashboardContent
      projectSlug={projectSlug}
      subsectionSlug={subsectionSlug}
      subsection={subsection}
      subsections={subsections}
    />
  )
}
