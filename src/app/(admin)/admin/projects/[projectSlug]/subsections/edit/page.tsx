import { Breadcrumb } from "@/src/app/(admin)/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/(admin)/admin/_components/HeaderWrapper"
import { invoke } from "@/src/blitz-server"
import getProject from "@/src/server/projects/queries/getProject"
import { Metadata } from "next"
import "server-only"
import { SubsectionPlacemarkImport } from "../_components/SubsectionPlacemarkImport"

export const metadata: Metadata = { title: "Planungsabschnitte bearbeiten" }

export default async function AdminProjectSubsectionsEditPage({
  params: { projectSlug },
}: {
  params: { projectSlug: string }
}) {
  const project = await invoke(getProject, { projectSlug })
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/projects", name: "Projekte" },
            {
              href: `/admin/projects/${projectSlug}/subsections`,
              name: `Projekt ${projectSlug}: Planungsabschnitte`,
            },
            { name: "Geometrien bearbeiten" },
          ]}
        />
      </HeaderWrapper>
      <SubsectionPlacemarkImport project={project} />
    </>
  )
}
