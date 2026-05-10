import { EditUploadForm } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadForm"
import {
  getUploadReturnTarget,
  parseReturnProjectRecordId,
} from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_utils/getUploadReturnTarget"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import {
  parseProjectScopedReturnTo,
  RETURN_PROJECT_RECORD_ID_PARAM,
  ReturnToSearchParams,
} from "@/src/core/routes/returnTo"
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
  searchParams?: ReturnToSearchParams & { [RETURN_PROJECT_RECORD_ID_PARAM]?: string }
}

export default async function EditUploadPage({
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
    returnProjectRecordId: parseReturnProjectRecordId(
      searchParams?.[RETURN_PROJECT_RECORD_ID_PARAM],
    ),
  })

  return (
    <>
      <PageHeader title="Dokument bearbeiten" className="mt-12" />
      <EditUploadForm upload={upload} returnPath={returnPath} returnText={returnText} />
    </>
  )
}
