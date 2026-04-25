import { EditUploadModalClient } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadModalClient"
import { invoke } from "@/src/blitz-server"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"

type Props = {
  params: { projectSlug: string; projectRecordId: string; uploadId: string }
}

export default async function ProjectRecordUploadEditModalPage({
  params: { projectSlug, projectRecordId, uploadId },
}: Props) {
  const upload = await invoke(getUploadWithRelations, {
    projectSlug,
    id: Number(uploadId),
  })

  return (
    <EditUploadModalClient
      upload={upload}
      returnPath={projectRecordDetailRoute(projectSlug, Number(projectRecordId))}
      returnText="Zurück zum Protokoll"
    />
  )
}
