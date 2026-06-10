import { useQuery } from "@tanstack/react-query"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/components/uploads/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/components/uploads/UploadPreviewClickable"
import { surveyResponseUploadsSplitQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"
import { getFlatSurveyFormFields } from "./getFlatSurveyFormFields"

type Props = {
  projectSlug: string
  surveyId: number
  responseId: number
  responseData: Record<string, any>
  surveySlug: AllowedSurveySlugs
  refetchResponsesAndTopics: () => Promise<void>
}

export const EditableSurveyResponseUploadsSection = ({
  projectSlug,
  surveyId,
  responseId,
  responseData,
  surveySlug,
  refetchResponsesAndTopics,
}: Props) => {
  const buildSurveyResponseUploadEditLink = (uploadId: number) => ({
    to: "/$projectSlug/surveys/$surveyId/responses/$surveyResponseId/uploads/$uploadId/edit" as const,
    params: {
      projectSlug,
      surveyId: String(surveyId),
      surveyResponseId: String(responseId),
      uploadId: String(uploadId),
    },
  })

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

  const {
    data: uploadsSplit = { uploadsInData: [], uploadsNotInData: [] },
    refetch: refetchUploads,
  } = useQuery(
    surveyResponseUploadsSplitQueryOptions({
      projectSlug,
      surveyResponseId: responseId,
    }),
  )

  const { uploadsInData, uploadsNotInData } = uploadsSplit

  const handleUploadComplete = async () => {
    // Uploads are already linked during creation, just refetch to update the UI
    await refetchUploads()
    await refetchResponsesAndTopics()
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
                upload={upload}
                projectSlug={projectSlug}
                size="grid"
                editLink={buildSurveyResponseUploadEditLink(upload.id)}
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
              upload={upload}
              projectSlug={projectSlug}
              size="grid"
              editLink={buildSurveyResponseUploadEditLink(upload.id)}
              onDeleted={async () => {}}
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
