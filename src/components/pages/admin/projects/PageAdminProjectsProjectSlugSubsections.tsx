import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { SubsectionTableAdmin } from "@/src/components/admin/projects/[projectSlug]/subsections/SubsectionTableAdmin"
import { Link as CoreLink } from "@/src/components/core/components/links/Link"
import { PageHeaderLayout } from "@/src/components/core/components/PageHeader/PageHeaderLayout"
import { PageHeaderRowActions } from "@/src/components/core/components/PageHeader/PageHeaderRowActions"
import { Spinner } from "@/src/components/core/components/Spinner"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

const routeApi = getRouteApi("/admin/projects/$projectSlug/subsections/")

export function PageAdminProjectsProjectSlugSubsections() {
  const { projectSlug } = routeApi.useParams()
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))

  return (
    <>
      <AdminPageHeader
        parent={{ title: "Alle Projekte", href: "/admin/projects" }}
        title={`Planungsabschnitte: ${projectSlug}`}
      />
      <PageHeaderLayout
        row2={{
          left: project.exportEnabled ? undefined : (
            <p className="truncate text-sm text-gray-500">
              Um mehrere Geometrien gleichzeitig in Placemark Play zu bearbeiten, muss{" "}
              <Link to="/$projectSlug/edit" params={{ projectSlug }}>
                die Export-API des Projekts eingeschaltet werden
              </Link>
              .
            </p>
          ),
          right: (
            <PageHeaderRowActions>
              {project.exportEnabled ? (
                <CoreLink
                  button
                  buttonSize="sm"
                  icon="edit"
                  to="/admin/projects/$projectSlug/subsections/edit"
                  params={{ projectSlug }}
                >
                  Geometrien bearbeiten
                </CoreLink>
              ) : null}
              <CoreLink
                button
                buttonSize="sm"
                icon="plus"
                to="/admin/projects/$projectSlug/subsections/multiple-new"
                params={{ projectSlug }}
              >
                Mehrere Planungsabschnitte erstellen
              </CoreLink>
            </PageHeaderRowActions>
          ),
        }}
      />
      <Suspense fallback={<Spinner page />}>
        <SubsectionTableAdmin projectSlug={projectSlug} />
      </Suspense>
    </>
  )
}
