import { TBackendConfig } from "@/src/app/beteiligung/_shared/backend-types"

type Props = {
  additionalFilterFields: TBackendConfig["additionalFilters"]
  surveyPart1ResponseData: any
  surveyPart3ResponseData: any
  surveyPart2ResponseData: any
}

const EditableSurveyResponseAdditionalFilterFields = ({
  additionalFilterFields,
  surveyPart1ResponseData,
  surveyPart3ResponseData,
  surveyPart2ResponseData,
}: Props) => {
  if (!additionalFilterFields) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 md:max-w-screen-md">
      <table className="min-w-full">
        <tbody className="divide-y divide-gray-200 bg-white">
          {additionalFilterFields.map((item) => (
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
        </tbody>
      </table>
    </div>
  )
}

export default EditableSurveyResponseAdditionalFilterFields
