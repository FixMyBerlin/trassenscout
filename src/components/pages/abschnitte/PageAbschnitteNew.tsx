import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { NewSubsectionForm } from "@/src/components/abschnitte/NewSubsectionForm"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/abschnitte/new/")

export function PageAbschnitteNew() {
  const { projectSlug } = routeApi.useParams()
  return (
    <>
      <PageHeader breadcrumb={<AbschnitteBreadcrumb current="neu" />} />
      <Suspense fallback={<Spinner />}>
        <NewSubsectionForm projectSlug={projectSlug} />
      </Suspense>
      <hr className="my-5 text-gray-200" />
      <Link to="/$projectSlug" params={{ projectSlug }}>
        Zurück Übersicht
      </Link>
    </>
  )
}
