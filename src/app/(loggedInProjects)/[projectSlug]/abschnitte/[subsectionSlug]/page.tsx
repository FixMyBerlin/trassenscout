import { invoke } from "@/src/blitz-server"
import { seoTitleSlug } from "@/src/core/components/text"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import "server-only"
import { SubsectionDashboardClient } from "./_components/SubsectionDashboardClient"

export async function generateMetadata({
  params,
}: {
  params: { projectSlug: string; subsectionSlug: string }
}) {
  const subsections = await invoke(getSubsections, { projectSlug: params.projectSlug })
  const subsection = subsections.subsections.find((ss) => ss.slug === params.subsectionSlug)
  return {
    title: subsection ? seoTitleSlug(subsection.slug) : "Planungsabschnitt",
    robots: "noindex",
  }
}

type Props = {
  params: { projectSlug: string; subsectionSlug: string }
}

export default async function SubsectionDashboardPage({ params: { projectSlug } }: Props) {
  const subsections = await invoke(getSubsections, { projectSlug })
  const subsubsections = await invoke(getSubsubsections, { projectSlug })

  return (
    <SubsectionDashboardClient
      initialSubsections={subsections}
      initialSubsubsections={subsubsections}
    />
  )
}
