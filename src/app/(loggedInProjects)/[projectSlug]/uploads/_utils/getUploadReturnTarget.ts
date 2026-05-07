import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { Route } from "next"

type UploadWithRelations = Awaited<ReturnType<typeof getUploadWithRelations>>
type ReturnTarget = {
  returnPath: Route
  returnText: string
}

export const parseReturnProjectRecordId = (value?: string) => {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

export const getUploadReturnTarget = ({
  projectSlug,
  upload,
  returnProjectRecordId,
}: {
  projectSlug: string
  upload: UploadWithRelations
  returnProjectRecordId?: number
}): ReturnTarget => {
  let returnPath: ReturnTarget["returnPath"]
  let returnText: ReturnTarget["returnText"]

  if (returnProjectRecordId) {
    returnPath = projectRecordDetailRoute(projectSlug, returnProjectRecordId)
    returnText = "Zurück zum Protokoll"
  } else if (upload.projectRecords.length > 0) {
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
