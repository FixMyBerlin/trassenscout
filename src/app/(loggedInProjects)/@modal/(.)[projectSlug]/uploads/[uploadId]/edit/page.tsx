import { EditUploadModalClient } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadModalClient"
import {
  getUploadReturnTarget,
  parseReturnProjectRecordId,
} from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_utils/getUploadReturnTarget"
import { invoke } from "@/src/blitz-server"
import {
  parseProjectScopedReturnTo,
  RETURN_PROJECT_RECORD_ID_PARAM,
  ReturnToSearchParams,
} from "@/src/core/routes/returnTo"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"

type Props = {
  params: { projectSlug: string; uploadId: string }
  searchParams?: ReturnToSearchParams & { [RETURN_PROJECT_RECORD_ID_PARAM]?: string }
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
    returnTo: parseProjectScopedReturnTo(searchParams?.returnTo, projectSlug),
    returnProjectRecordId: parseReturnProjectRecordId(searchParams?.[RETURN_PROJECT_RECORD_ID_PARAM]),
  })

  return <EditUploadModalClient upload={upload} returnPath={returnPath} returnText={returnText} />
}
