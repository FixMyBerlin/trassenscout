import { EditUploadForm } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getUploadWithSubsections from "@/src/server/uploads/queries/getUploadWithSubsections"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Dokument"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; uploadId: string }
  searchParams: { returnPath?: string }
}

export default async function EditUploadPage({ params, searchParams }: Props) {
  const upload = await invoke(getUploadWithSubsections, {
    projectSlug: params.projectSlug,
    id: Number(params.uploadId),
  })

  const { subsections } = await invoke(getSubsections, { projectSlug: params.projectSlug })

  return (
    <>
      <PageHeader title="Dokument bearbeiten" className="mt-12" />
      <EditUploadForm
        upload={upload}
        subsections={subsections}
        projectSlug={params.projectSlug}
        returnPath={searchParams.returnPath}
      />
    </>
  )
}
