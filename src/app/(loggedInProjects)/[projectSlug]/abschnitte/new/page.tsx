import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { projectDashboardRoute } from "@/src/core/routes/projectRoutes"
import getProject from "@/src/server/projects/queries/getProject"
import getSubsectionMaxOrder from "@/src/server/subsections/queries/getSubsectionMaxOrder"
import "server-only"
import { NewSubsectionClient } from "./_components/NewSubsectionClient"

export async function generateMetadata({ params }: { params: { projectSlug: string } }) {
  return {
    title: seoNewTitle("Planungsabschnitt"),
    robots: "noindex",
  }
}

type Props = {
  params: { projectSlug: string }
}

export default async function NewSubsectionPage({ params: { projectSlug } }: Props) {
  const project = await invoke(getProject, { projectSlug })
  const maxOrder = await invoke(getSubsectionMaxOrder, project.id)

  return (
    <>
      <PageHeader title="Planungsabschitt hinzufügen" className="mt-12" />
      <NewSubsectionClient initialMaxOrder={maxOrder} projectId={project.id} />
      <hr className="my-5 text-gray-200" />
      <p>
        <Link href={projectDashboardRoute(projectSlug)}>Zurück Übersicht</Link>
      </p>
    </>
  )
}
