import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { SubsectionTableAdmin } from "@/src/components/admin/projects/[projectSlug]/subsections/SubsectionTableAdmin"
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
      {project.exportEnabled ? (
        <Link
          className="inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
          to="/admin/projects/$projectSlug/subsections/edit"
          params={{ projectSlug }}
        >
          Geometrien bearbeiten
        </Link>
      ) : (
        <div>
          Um mehrere Geometrien gleichzeitig in Placemark Play zu bearbeiten, muss{" "}
          <Link to="/$projectSlug/edit" params={{ projectSlug }}>
            die Export-API des Projekts eingeschaltet werden
          </Link>
          .
        </div>
      )}
      <Suspense fallback={<Spinner page />}>
        <SubsectionTableAdmin projectSlug={projectSlug} />
      </Suspense>
    </>
  )
}
