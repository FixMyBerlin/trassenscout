import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { Route } from "next"

type UploadWithRelations = Awaited<ReturnType<typeof getUploadWithRelations>>

export const getUploadReturnTarget = ({
  projectSlug,
  upload,
}: {
  projectSlug: string
  upload: UploadWithRelations
}) => {
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

  return { returnPath, returnText }
}
