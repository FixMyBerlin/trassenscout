import { EditUploadForm } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadForm"
import { getUploadReturnTarget } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_utils/getUploadReturnTarget"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
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
}

export default async function EditUploadPage({ params: { projectSlug, uploadId } }: Props) {
  const upload = await invoke(getUploadWithRelations, {
    projectSlug,
    id: Number(uploadId),
  })

  const { returnPath, returnText } = getUploadReturnTarget({ projectSlug, upload })

  return (
    <>
      <PageHeader title="Dokument bearbeiten" className="mt-12" />
      <EditUploadForm upload={upload} returnPath={returnPath} returnText={returnText} />
    </>
  )
}
