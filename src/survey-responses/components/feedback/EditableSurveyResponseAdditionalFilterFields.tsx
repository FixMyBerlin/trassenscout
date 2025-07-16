import { TBackendConfig } from "@/src/app/beteiligung/_shared/backend-types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { getFlatSurveyFormFields } from "@/src/survey-responses/utils/getQuestionsAsArray"

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
    "geometryCategorySourceId",
    "geometryCategoryFeatureId",
  ]
  const additionaFilterKeysPart2ForFilter =
    additionalFilterFields?.filter((f) => f.surveyPart === "part2").map((f) => f.id) || []
  const part2Config = getConfigBySurveySlug(surveySlug, "part2")
  const part2Fields = getFlatSurveyFormFields(part2Config)

  const filteredPart2Responses = Object.entries(surveyPart2ResponseData).filter(
    ([key]) =>
      !standardFieldsForFilter.includes(key) &&
      // !key.startsWith("geometry") &&
      !additionaFilterKeysPart2ForFilter.includes(key),
  )

  if (!additionalFilterFields?.length && !filteredPart2Responses.length) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 md:max-w-screen-md">
      <table className="min-w-full">
        <tbody className="divide-y divide-gray-200 bg-white">
          {additionalFilterFields &&
            additionalFilterFields.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {item.label}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.surveyPart === "part1"
                    ? surveyPart1ResponseData
                      ? surveyPart1ResponseData[String(item.id)] || "-"
                      : "(kein Umfrage-Teil zu diesem Eintrag)"
                    : item.surveyPart === "part2"
                      ? surveyPart2ResponseData[String(item.id)] || "-"
                      : item.surveyPart === "part3"
                        ? surveyPart3ResponseData
                          ? surveyPart3ResponseData[String(item.id)] || "-"
                          : "(kein Umfrage-Teil zu diesem Eintrag)"
                        : "(unbekannter Umfrage-Teil)"}
                </td>
              </tr>
            ))}
          {filteredPart2Responses.map(([key, value]) => {
            let displayValue: string
            try {
              const parsedValue = JSON.parse(value)
              displayValue = Array.isArray(parsedValue) ? parsedValue.join(", ") : value
            } catch {
              displayValue = value
            }

            return (
              <tr key={key}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {part2Fields.find((field) => field.name === key)?.props.label || key}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{displayValue || "-"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default EditableSurveyResponseAdditionalFilterFields
