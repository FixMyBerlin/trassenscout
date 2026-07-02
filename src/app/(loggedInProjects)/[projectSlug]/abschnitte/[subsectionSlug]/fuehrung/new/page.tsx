import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import "server-only"
import { NewSubsubsectionClient } from "./_components/NewSubsubsectionClient"

export async function generateMetadata({
  params: _params,
}: {
  params: { projectSlug: string; subsectionSlug: string }
}) {
  return {
    title: seoNewTitle("Eintrag"),
    robots: "noindex",
  }
}

type Props = {
  params: { projectSlug: string; subsectionSlug: string }
}

export default async function NewSubsubsectionPage({
  params: { projectSlug, subsectionSlug },
}: Props) {
  const subsection = await invoke(getSubsection, { projectSlug, subsectionSlug })

  return (
    <>
      <PageHeader title="Neuen Eintrag hinzufügen" subtitle={subsection.slug} className="mt-12" />
      <NewSubsubsectionClient initialSubsection={subsection} />
    </>
  )
}
