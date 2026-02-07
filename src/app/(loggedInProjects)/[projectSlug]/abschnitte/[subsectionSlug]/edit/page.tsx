import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitleSlug, shortTitle } from "@/src/core/components/text"
import getProject from "@/src/server/projects/queries/getProject"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import "server-only"
import { EditSubsectionClient } from "./_components/EditSubsectionClient"

export async function generateMetadata({
  params,
}: {
  params: { projectSlug: string; subsectionSlug: string }
}) {
  const subsection = await invoke(getSubsection, {
    projectSlug: params.projectSlug,
    subsectionSlug: params.subsectionSlug,
  })
  return {
    title: seoEditTitleSlug(subsection.slug),
    robots: "noindex",
  }
}

type Props = {
  params: { projectSlug: string; subsectionSlug: string }
}

export default async function EditSubsectionPage({
  params: { projectSlug, subsectionSlug },
}: Props) {
  const subsection = await invoke(getSubsection, { projectSlug, subsectionSlug })
  const project = await invoke(getProject, { projectSlug })

  return (
    <>
      <PageHeader title={`${shortTitle(subsection.slug)} bearbeiten`} className="mt-12" />
      <EditSubsectionClient initialSubsection={subsection} initialProject={project} />
      <SuperAdminLogData data={subsection} />
    </>
  )
}
