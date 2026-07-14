import { useQuery } from "@tanstack/react-query"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadTable } from "@/src/components/uploads/UploadTable"
import { surveyResponseUploadsSplitQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"
import { getFlatSurveyFormFields } from "./getFlatSurveyFormFields"

type Props = {
  projectSlug: string
  surveyId: number
  responseId: number
  responseData: Record<string, any>
  surveySlug: AllowedSurveySlugs
  refetchResponsesAndTopics: () => Promise<void>
  withTags?: boolean
}

export const EditableSurveyResponseUploadsSection = ({
  projectSlug,
  surveyId: _surveyId,
  responseId,
  responseData,
  surveySlug,
  refetchResponsesAndTopics,
  withTags,
}: Props) => {
  // Upload description (stored in response.data)
  const part2Config = getConfigBySurveySlug(surveySlug, "part2")
  const part2Fields = getFlatSurveyFormFields(part2Config)
  const uploadDescriptionQuestionId = getQuestionIdBySurveySlug(surveySlug, "uploadsDescription")
  const uploadDescription =
    uploadDescriptionQuestionId && uploadDescriptionQuestionId in responseData
      ? responseData[uploadDescriptionQuestionId]
      : null
  const uploadDescriptionLabel =
    part2Fields.find((field) => field.name === uploadDescriptionQuestionId)?.props.label ||
    "Beschreibung der Dokumente"
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
  const uploads = [
    ...uploadsInData.map((upload) => ({
      ...upload,
      source: "Formular",
    })),
    ...uploadsNotInData.map((upload) => ({
      ...upload,
      source: "Backend",
    })),
  ]

  const handleUploadComplete = async () => {
    // Uploads are already linked during creation, just refetch to update the UI
    await refetchUploads()
    await refetchResponsesAndTopics()
  }

  return (
    <div className="space-y-3">
      {uploadDescriptionSection}

      <div className="flex flex-col gap-2">
        <UploadTable
          projectSlug={projectSlug}
          withAction={false}
          withRelations={false}
          withSource
          withTags={withTags}
          uploads={uploads}
          onDelete={async () => {
            await refetchUploads()
          }}
        />
        <IfUserCanEdit>
          <UploadDropzone
            projectSlug={projectSlug}
            surveyResponseId={responseId}
            onUploadComplete={handleUploadComplete}
          />
        </IfUserCanEdit>
      </div>
    </div>
  )
}
