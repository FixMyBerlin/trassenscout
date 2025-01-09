import {
  getFeedbackDefinitionBySurveySlug,
  getSurveyDefinitionBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import { getQuestionsAsArray } from "@/src/survey-public/utils/getQuestionsAsArray"
import { useParam } from "@blitzjs/next"
import { XCircleIcon } from "@heroicons/react/20/solid"
import { FieldErrors, FieldValues } from "react-hook-form"

type Props = {
  formErrors: FieldErrors<FieldValues>
  customErrors?: { [key: string]: { message: string } }
  surveyPart: "survey" | "feedback"
}

export const SurveyFormErrorsBox = ({ formErrors, surveyPart, customErrors }: Props) => {
  const surveySlug = useParam("surveySlug", "string")
  if (!Object.keys(formErrors).length && !customErrors) return null

  const definition =
    surveyPart === "survey"
      ? // @ts-expect-error
        getSurveyDefinitionBySurveySlug(surveySlug!)
      : // @ts-expect-error
        getFeedbackDefinitionBySurveySlug(surveySlug!)

  const questions = getQuestionsAsArray({ definition, surveyPart })

  return (
    <div className="mt-12 flex gap-4 rounded-lg bg-red-50 p-4">
      <XCircleIcon className="h-6 w-6 shrink-0 text-red-500" />
      <ul>
        {customErrors &&
          Object.entries(customErrors)?.map(([key, error]) => {
            const questionText = questions.find(
              (question) => question?.id == Number(key.split("-")[1]),
            )?.label.de
            return (
              <li key={key + error.message} id={key + "Hint"} className="text-sm text-red-800">
                <span className="font-semibold">{questionText}</span>: {error.message}
              </li>
            )
          })}
        {Object.entries(formErrors)?.map(([key, error]) => {
          const questionText = questions.find(
            (question) => question?.id == Number(key.split("-")[1]),
          )?.label.de
          return (
            // @ts-expect-error
            <li key={key + error.message} id={key + "Hint"} className="text-sm text-red-800">
              {/* @ts-expect-error */}
              <span className="font-semibold">{questionText}</span>: {error.message}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
