import { UploadsTableWithFilter } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadsTableWithFilter"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getUploads from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Dokumente",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
  searchParams: { page?: string; filterSubsectionId?: string }
}

const ITEMS_PER_PAGE = 100

export default async function UploadsPage({ params, searchParams }: Props) {
  const page = Number(searchParams.page) || 0
  const { uploads, hasMore } = await invoke(getUploads, {
    projectSlug: params.projectSlug,
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const { subsections } = await invoke(getSubsections, { projectSlug: params.projectSlug })

  return (
    <>
      <PageHeader
        title="Dokumente"
        description="Dokumente und Grafiken hochladen und bei Bedarf mit einem Planungsabschnitt verknüpfen."
        className="mt-12"
      />
      <UploadsTableWithFilter
        uploads={uploads}
        subsections={subsections}
        hasMore={hasMore}
        page={page}
        projectSlug={params.projectSlug}
        filterSubsectionId={searchParams.filterSubsectionId}
      />
    </>
  )
}
