import { TBackendConfig } from "@/src/survey-public/utils/backend-config-defaults"

type Props = {
  additionalFilterFields: TBackendConfig["additionalFilters"]
  surveyData: any
  feedbackData: any
}

const EditableSurveyResponseAdditionalFilterFields = ({
  additionalFilterFields,
  surveyData,
  feedbackData,
}: Props) => {
  if (!additionalFilterFields) return null
  return (
    <div className="my-8 rounded-lg border border-gray-200 bg-white p-2 md:max-w-screen-md">
      <table className="min-w-full">
        <tbody className="divide-y divide-gray-200 bg-white">
          {additionalFilterFields.map((item) => (
            <tr key={item.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {item.label}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {item.surveyPart === "feedback"
                  ? feedbackData[String(item.id)] || "-"
                  : // see comment in src/survey-responses/queries/getSurveySurveyResponsesBySurveySessionId.ts
                    surveyData
                    ? surveyData[String(item.id)]
                    : "(kein Hinweis-Teil zu diesem Eintrag)"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EditableSurveyResponseAdditionalFilterFields
