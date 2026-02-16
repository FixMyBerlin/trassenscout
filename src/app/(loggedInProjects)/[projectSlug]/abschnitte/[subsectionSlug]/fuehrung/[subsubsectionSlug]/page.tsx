import { invoke } from "@/src/blitz-server"
import { seoTitleSlug } from "@/src/core/components/text"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import "server-only"
import { SubsectionDashboardClient } from "../../_components/SubsectionDashboardClient"

export async function generateMetadata({
  params,
}: {
  params: { projectSlug: string; subsectionSlug: string; subsubsectionSlug: string }
}) {
  const subsubsections = await invoke(getSubsubsections, { projectSlug: params.projectSlug })
  const subsubsection = subsubsections.subsubsections.find(
    (ss) => ss.slug === params.subsubsectionSlug,
  )
  return {
    title: subsubsection ? seoTitleSlug(subsubsection.slug) : "Eintrag",
    robots: "noindex",
  }
}

type Props = {
  params: { projectSlug: string; subsectionSlug: string; subsubsectionSlug: string }
}

export default async function SubsubsectionDashboardPage({ params: { projectSlug } }: Props) {
  const subsections = await invoke(getSubsections, { projectSlug })
  const subsubsections = await invoke(getSubsubsections, { projectSlug })

  return (
    <SubsectionDashboardClient
      initialSubsections={subsections}
      initialSubsubsections={subsubsections}
    />
  )
}
