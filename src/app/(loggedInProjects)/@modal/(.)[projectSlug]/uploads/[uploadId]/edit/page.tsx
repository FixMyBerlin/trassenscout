import { EditUploadModalClient } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadModalClient"
import { invoke } from "@/src/blitz-server"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { Route } from "next"

type Props = {
  params: { projectSlug: string; uploadId: string }
}

export default async function UploadEditModalPage({ params: { projectSlug, uploadId } }: Props) {
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

  return <EditUploadModalClient upload={upload} returnPath={returnPath} returnText={returnText} />
}
