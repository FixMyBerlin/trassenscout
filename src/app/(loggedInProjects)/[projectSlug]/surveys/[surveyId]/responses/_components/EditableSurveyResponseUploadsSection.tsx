"use client"

import { getFlatSurveyFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_utils/getFlatSurveyFormFields"
import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { surveyResponseUploadEditRoute } from "@/src/core/routes/uploadRoutes"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import getSurveyResponseUploadsSplit from "@/src/server/uploads/queries/getSurveyResponseUploadsSplit"
import { invalidateQuery, useQuery } from "@blitzjs/rpc"

type Props = {
  projectSlug: string
  surveyId: number
  responseId: number
  responseData: Record<string, any>
  surveySlug: AllowedSurveySlugs
}

export const EditableSurveyResponseUploadsSection = ({
  projectSlug,
  surveyId,
  responseId,
  responseData,
  surveySlug,
}: Props) => {
  // Upload description (stored in response.data)
  const part2Config = getConfigBySurveySlug(surveySlug, "part2")
  const part2Fields = getFlatSurveyFormFields(part2Config)
  const uploadDescriptionQuestionId = getQuestionIdBySurveySlug(surveySlug, "uploadsDescription")
  const uploadsQuestionId = getQuestionIdBySurveySlug(surveySlug, "uploads")
  const uploadDescription =
    uploadDescriptionQuestionId && uploadDescriptionQuestionId in responseData
      ? responseData[uploadDescriptionQuestionId]
      : null
  const uploadDescriptionLabel =
    part2Fields.find((field) => field.name === uploadDescriptionQuestionId)?.props.label ||
    "Beschreibung der Dokumente"
  const uploadsLabel =
    part2Fields.find((field) => field.name === uploadsQuestionId)?.props.label || "Dokumente"

  const uploadDescriptionSection = uploadDescription ? (
    <div className="max-w-2xl">
      <div className="mb-3 text-sm font-medium whitespace-nowrap text-gray-900">
        {uploadDescriptionLabel}
      </div>
      <div className="mt-1 text-sm text-gray-500">{uploadDescription}</div>
    </div>
  ) : null

  // Uploads linked to this response, split by whether they're stored in response.data
  const [
    { uploadsInData = [], uploadsNotInData = [] } = { uploadsInData: [], uploadsNotInData: [] },
    { refetch: refetchUploads },
  ] = useQuery(getSurveyResponseUploadsSplit, {
    projectSlug,
    surveyResponseId: responseId,
  })

  const handleUploadComplete = async () => {
    // Uploads are already linked during creation, just refetch to update the UI
    await refetchUploads()
    // Invalidate main query to update parent component
    invalidateQuery(getFeedbackSurveyResponsesWithSurveyDataAndComments)
  }

  return (
    <div className="flex flex-col gap-4">
      {uploadDescriptionSection}

      {uploadsInData.length > 0 && (
        <>
          <div className="text-sm font-medium text-gray-900">
            {uploadsLabel} (im Formular hochgeladen)
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {uploadsInData.map((upload) => (
              <UploadPreviewClickable
                key={upload.id}
                uploadId={upload.id}
                projectSlug={projectSlug}
                size="grid"
                editUrl={surveyResponseUploadEditRoute(projectSlug, surveyId, responseId, upload.id)}
              />
            ))}
          </div>
        </>
      )}

      <div className="text-sm font-medium text-gray-900">
        {uploadsInData.length > 0 && "Weitere "}Dokumente verknüpfen
      </div>

      {uploadsNotInData.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {uploadsNotInData.map((upload) => (
            <UploadPreviewClickable
              key={upload.id}
              uploadId={upload.id}
              projectSlug={projectSlug}
              size="grid"
              editUrl={surveyResponseUploadEditRoute(projectSlug, surveyId, responseId, upload.id)}
            />
          ))}
        </div>
      )}

      <IfUserCanEdit>
        <UploadDropzoneContainer className="h-40 max-w-md border border-gray-300 p-2">
          <UploadDropzone
            fillContainer
            surveyResponseId={responseId}
            onUploadComplete={handleUploadComplete}
          />
        </UploadDropzoneContainer>
      </IfUserCanEdit>
    </div>
  )
}
