import { getFlatSurveyFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_utils/getFlatSurveyFormFields"
import { TBackendConfig } from "@/src/app/beteiligung/_shared/backend-types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { SurveyResponseFieldValue } from "@/src/app/beteiligung/_shared/utils/SurveyResponseFieldValue"

type Props = {
  additionalFilterFields: TBackendConfig["additionalFilters"]
  surveyPart1ResponseData: Record<string, any> | null
  surveyPart3ResponseData: Record<string, any> | null
  surveyPart2ResponseData: Record<string, any>
  surveySlug: AllowedSurveySlugs
}

const EditableSurveyResponseAdditionalFilterFields = ({
  additionalFilterFields,
  surveyPart1ResponseData,
  surveyPart3ResponseData,
  surveyPart2ResponseData,
  surveySlug,
}: Props) => {
  const standardFieldsForFilter = [
    getQuestionIdBySurveySlug(surveySlug, "feedbackText"),
    getQuestionIdBySurveySlug(surveySlug, "feedbackText_2"),
    getQuestionIdBySurveySlug(surveySlug, "category"),
    getQuestionIdBySurveySlug(surveySlug, "geometryCategory"),
    getQuestionIdBySurveySlug(surveySlug, "location"),
    getQuestionIdBySurveySlug(surveySlug, "enableLocation"),
    getQuestionIdBySurveySlug(surveySlug, "uploads"),
    getQuestionIdBySurveySlug(surveySlug, "uploadsDescription"),
    "geometryCategorySourceId",
    "geometryCategoryFeatureId",
  ]
  const additionaFilterKeysPart2ForFilter =
    additionalFilterFields?.filter((f) => f.surveyPart === "part2").map((f) => f.id) || []
  const part1Config = getConfigBySurveySlug(surveySlug, "part1")
  const part2Config = getConfigBySurveySlug(surveySlug, "part2")
  const part3Config = getConfigBySurveySlug(surveySlug, "part3")
  const part1Fields = getFlatSurveyFormFields(part1Config)
  const part2Fields = getFlatSurveyFormFields(part2Config)
  const part3Fields = getFlatSurveyFormFields(part3Config)

  const filteredPart2Responses = Object.entries(surveyPart2ResponseData).filter(
    ([key]) =>
      !(
        surveySlug === "ohv-haltestellenfoerderung" &&
        key === "subsubsectionId" &&
        typeof surveyPart2ResponseData.vorgangsId === "string"
      ) &&
      !standardFieldsForFilter.includes(key) &&
      // !key.startsWith("geometry") &&
      !additionaFilterKeysPart2ForFilter.includes(key),
  )

  const partLookup: Record<
    string,
    { fields: ReturnType<typeof getFlatSurveyFormFields>; data: Record<string, unknown> | null }
  > = {
    part1: { fields: part1Fields, data: surveyPart1ResponseData },
    part2: { fields: part2Fields, data: surveyPart2ResponseData },
    part3: { fields: part3Fields, data: surveyPart3ResponseData },
  }

  if (!additionalFilterFields?.length && !filteredPart2Responses.length) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 md:max-w-(--breakpoint-md)">
      <table className="min-w-full">
        <tbody className="divide-y divide-gray-200 bg-white">
          {additionalFilterFields &&
            additionalFilterFields.map((item) => {
              const fieldKey = String(item.id)
              const part = partLookup[item.surveyPart]
              const field = part?.fields.find((f) => f.name === fieldKey)
              const value = part?.data?.[fieldKey]
              const hasResponseData = part != null && part.data != null

              if (!hasResponseData) {
                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      {item.label}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      (kein Umfrage-Teil zu diesem Eintrag)
                    </td>
                  </tr>
                )
              }

              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                    {field?.props?.label || item.label}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <SurveyResponseFieldValue field={field} value={value} />
                  </td>
                </tr>
              )
            })}
          {filteredPart2Responses.map(([key, value]) => {
            const isHistoricalOhvVorgangsId =
              surveySlug === "ohv-haltestellenfoerderung" && key === "subsubsectionId"
            const field = part2Fields.find((f) =>
              f.name === (isHistoricalOhvVorgangsId ? "vorgangsId" : key),
            )
            return (
              <tr key={key}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {field?.props?.label || key}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <SurveyResponseFieldValue field={field} value={value} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default EditableSurveyResponseAdditionalFilterFields
