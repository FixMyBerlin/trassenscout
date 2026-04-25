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
  params: { projectSlug: string; uploadId: string }
}

export default async function EditUploadPage({ params: { projectSlug, uploadId } }: Props) {
  const upload = await invoke(getUploadWithRelations, {
    projectSlug,
    id: Number(uploadId),
  })

  let returnPath: Route
  let returnText: string

  if (upload.projectRecords.length > 0) {
    returnPath = projectRecordDetailRoute(projectSlug, upload.projectRecords[0]!.id)
    returnText = "Zurück zum Protokoll"
  } else if (upload.Subsubsection) {
    returnPath =
      `/${projectSlug}/abschnitte/${upload.Subsubsection.subsection.slug}/fuehrung/${upload.Subsubsection.slug}` as Route
    returnText = "Zurück zum Eintrag"
  } else {
    returnPath = `/${projectSlug}/uploads` as Route
    returnText = "Zurück zu den Dokumenten"
  }

  return (
    <>
      <PageHeader title="Dokument bearbeiten" className="mt-12" />
      <EditUploadForm upload={upload} returnPath={returnPath} returnText={returnText} />
    </>
  )
}
