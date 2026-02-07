import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitleSlug } from "@/src/core/components/text"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import "server-only"
import { EditSubsubsectionClient } from "./_components/EditSubsubsectionClient"

export async function generateMetadata({
  params,
}: {
  params: { projectSlug: string; subsectionSlug: string; subsubsectionSlug: string }
}) {
  const subsubsection = await invoke(getSubsubsection, {
    projectSlug: params.projectSlug,
    subsectionSlug: params.subsectionSlug,
    subsubsectionSlug: params.subsubsectionSlug,
  })
  return {
    title: seoEditTitleSlug(subsubsection.slug),
    robots: "noindex",
  }
}

type Props = {
  params: { projectSlug: string; subsectionSlug: string; subsubsectionSlug: string }
}

export default async function EditSubsubsectionPage({
  params: { projectSlug, subsectionSlug, subsubsectionSlug },
}: Props) {
  const subsubsection = await invoke(getSubsubsection, {
    projectSlug,
    subsectionSlug,
    subsubsectionSlug,
  })

  return (
    <>
      <PageHeader title="Eintrag bearbeiten" className="mt-12" />
      <EditSubsubsectionClient initialSubsubsection={subsubsection} />
      <SuperAdminLogData data={subsubsection} />
    </>
  )
}
