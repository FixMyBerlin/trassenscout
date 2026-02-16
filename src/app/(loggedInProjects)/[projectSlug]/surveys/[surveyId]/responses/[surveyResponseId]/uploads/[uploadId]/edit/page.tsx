import { surveyResponsesHref } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/_utils/SurveyHrefs"
import { EditUploadForm } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/EditUploadForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
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
  params: {
    projectSlug: string
    surveyId: string
    surveyResponseId: string
    uploadId: string
  }
}

export default async function EditSurveyResponseUploadPage({
  params: { projectSlug, surveyId, surveyResponseId, uploadId },
}: Props) {
  const upload = await invoke(getUploadWithRelations, {
    projectSlug,
    id: Number(uploadId),
  })

  const returnPath: Route = surveyResponsesHref(projectSlug, Number(surveyId), {
    responseDetails: Number(surveyResponseId),
  })
  const returnText = "Zurück zu den Beiträgen"

  return (
    <>
      <PageHeader title="Dokument bearbeiten" className="mt-12" />
      <EditUploadForm upload={upload} returnPath={returnPath} returnText={returnText} />
    </>
  )
}
