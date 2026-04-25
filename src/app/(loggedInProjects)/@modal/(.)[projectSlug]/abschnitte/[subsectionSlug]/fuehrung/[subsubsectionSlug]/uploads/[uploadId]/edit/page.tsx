import { EditUploadModalClient } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadModalClient"
import { invoke } from "@/src/blitz-server"
import { Route } from "next"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"

type Props = {
  params: {
    projectSlug: string
    subsectionSlug: string
    subsubsectionSlug: string
    uploadId: string
  }
}

export default async function SubsubsectionUploadEditModalPage({
  params: { projectSlug, subsectionSlug, subsubsectionSlug, uploadId },
}: Props) {
  const upload = await invoke(getUploadWithRelations, {
    projectSlug,
    id: Number(uploadId),
  })

  const returnPath: Route =
    `/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}` as Route

  return <EditUploadModalClient upload={upload} returnPath={returnPath} returnText="Zurück zum Eintrag" />
}
