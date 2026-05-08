import { EditUploadModalClient } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadModalClient"
import {
  getUploadReturnTarget,
  parseReturnProjectRecordId,
} from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_utils/getUploadReturnTarget"
import { invoke } from "@/src/blitz-server"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"

type Props = {
  params: { projectSlug: string; uploadId: string }
  searchParams?: { returnProjectRecordId?: string }
}

export default async function UploadEditModalPage({
  params: { projectSlug, uploadId },
  searchParams,
}: Props) {
  const upload = await invoke(getUploadWithRelations, {
    projectSlug,
    id: Number(uploadId),
  })

  const { returnPath, returnText } = getUploadReturnTarget({
    projectSlug,
    returnProjectRecordId: parseReturnProjectRecordId(searchParams?.returnProjectRecordId),
  })

  return <EditUploadModalClient upload={upload} returnPath={returnPath} returnText={returnText} />
}
