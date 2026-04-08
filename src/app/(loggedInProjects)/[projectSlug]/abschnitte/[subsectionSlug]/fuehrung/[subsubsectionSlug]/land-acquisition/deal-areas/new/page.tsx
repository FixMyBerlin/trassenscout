import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { longTitle, seoIndexTitle } from "@/src/core/components/text"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import "server-only"
import { NewDealAreasClient } from "./_components/NewDealAreasClient"

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
    title: seoIndexTitle("Dealflächen erstellen", longTitle(subsubsection.slug)),
    robots: "noindex",
  }
}

type Props = {
  params: { projectSlug: string; subsectionSlug: string; subsubsectionSlug: string }
}

export default async function NewDealAreasPage({
  params: { projectSlug, subsectionSlug, subsubsectionSlug },
}: Props) {
  const subsubsection = await invoke(getSubsubsection, {
    projectSlug,
    subsectionSlug,
    subsubsectionSlug,
  })

  return (
    <>
      <PageHeader title="Dealflächen des Eintrags erstellen" className="mt-12" />
      <NewDealAreasClient initialSubsubsection={subsubsection} />
    </>
  )
}
