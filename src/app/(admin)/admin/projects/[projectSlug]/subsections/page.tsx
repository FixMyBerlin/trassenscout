import { Breadcrumb } from "@/src/app/(admin)/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/(admin)/admin/_components/HeaderWrapper"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import getProject from "@/src/server/projects/queries/getProject"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { Metadata } from "next"
import "server-only"
import { SubsectionTableAdmin } from "./_components/SubsectionTableAdmin"

export const metadata: Metadata = { title: "Planungsabschnitte" }

export default async function AdminProjectSubsectionsPage({
  params: { projectSlug },
}: {
  params: { projectSlug: string }
}) {
  const project = await invoke(getProject, { projectSlug })
  const { subsections } = await invoke(getSubsections, { projectSlug })

  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/projects", name: "Projekte" },
            { name: `Projekt ${projectSlug}: Planungsabschnitte` },
          ]}
        />
      </HeaderWrapper>
      {project.exportEnabled ? (
        <Link button href={`/admin/projects/${project.slug}/subsections/edit`}>
          Geometrien bearbeiten
        </Link>
      ) : (
        <div>
          Um mehrere Geometrien gleichzeitig in Placemark Play zu bearbeiten, muss{" "}
          <Link href={`${projectSlug}/edit/`}>
            die Export-API des Projekts eingeschaltet werden
          </Link>
          .
        </div>
      )}
      <SubsectionTableAdmin subsections={subsections} />
    </>
  )
}
