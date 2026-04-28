import { EditUploadModalClient } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadModalClient"
import { getUploadReturnTarget } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_utils/getUploadReturnTarget"
import { invoke } from "@/src/blitz-server"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"

type Props = {
  params: { projectSlug: string; uploadId: string }
}

export default async function UploadEditModalPage({ params: { projectSlug, uploadId } }: Props) {
  const upload = await invoke(getUploadWithRelations, {
    projectSlug,
    id: Number(uploadId),
  })

  const { returnPath, returnText } = getUploadReturnTarget({ projectSlug, upload })

  return <EditUploadModalClient upload={upload} returnPath={returnPath} returnText={returnText} />
}
