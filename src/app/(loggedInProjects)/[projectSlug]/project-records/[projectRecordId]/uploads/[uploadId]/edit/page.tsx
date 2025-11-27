import { EditUploadForm } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { Metadata, Route } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Dokument"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; projectRecordId: string; uploadId: string }
}

export default async function EditUploadPage({
  params: { projectSlug, projectRecordId, uploadId },
}: Props) {
  const upload = await invoke(getUploadWithRelations, {
    projectSlug,
    id: Number(uploadId),
  })

  const returnPath: Route = projectRecordDetailRoute(projectSlug, Number(projectRecordId))
  const returnText = "Zurück zum Protokoll"

  return (
    <>
      <PageHeader title="Dokument bearbeiten" className="mt-12" />
      <EditUploadForm upload={upload} returnPath={returnPath} returnText={returnText} />
    </>
  )
}
