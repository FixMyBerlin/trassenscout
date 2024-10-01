import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import { TBackendConfig } from "@/src/survey-public/utils/backend-config-defaults"

export const getAdditionalFiltersOptions = ({
  additionalFiltersConfig,
  surveySlug,
}: {
  additionalFiltersConfig: TBackendConfig["additionalFilters"]
  surveySlug: AllowedSurveySlugs
}) => {
  // brauchen wir alles doch nicht... i think
  // const suvreyQuestions = getQuestionsAsArray({
  //   definition: getSurveyDefinitionBySurveySlug(surveySlug),
  //   surveyPart: "survey",
  // })
  // const feedbackQuestions = getQuestionsAsArray({
  //   definition: getFeedbackDefinitionBySurveySlug(surveySlug),
  //   surveyPart: "feedback",
  // })
  additionalFiltersConfig?.map((f) => {
    if (f.surveyPart === "survey") {
      // const question = suvreyQuestions.find((q) => q.id)

      return {
        key: f.value,
        label: f.label,
        options:
          // todo: DB get all values for this question with f.id --> map to options
          [
            { value: "ALL", label: "Alle" },
            { value: "test-1", label: "Testinstitution1" },
            { value: "test-2", label: "Testinstitution2" },
          ],
      }
    } else {
      return {
        key: f.label,
        label: f.label,
        options:
          // todo: DB get all values for this question with f.id --> map to options
          [
            { value: "ALL", label: "Alle" },
            { value: "test-1", label: "Testinstitution1" },
            { value: "test-2", label: "Testinstitution2" },
          ],
      }
    }
  })
}
