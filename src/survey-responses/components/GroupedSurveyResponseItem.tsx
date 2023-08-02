import { H3 } from "src/core/components/text"
import surveyDefinition from "src/participation/data/survey.json"
import { Response, SingleOrMultiResponseProps, Survey } from "src/participation/data/types"
import VerticalBartChart from "./BarChart"
export { FORM_ERROR } from "src/core/components/forms"

type QuestionObject = {
  id: number
  label: string
  component: "singleResponse" | "multipleResponse" | "text"
  props: { responses: { id: number; text: string }[] }
}

function transformJSONToArray(json: Survey) {
  const pages = json.pages

  const transformedArray: QuestionObject[] = []

  pages.forEach((page) => {
    // Check if the page has questions
    if (page.questions && page.questions.length > 0) {
      const questions = page.questions
        .map((question) => {
          if (!("responses" in question.props)) return

          const questionObject = {
            id: question.id,
            label: question.label.de,
            component: question.component,
            props: {
              responses: question.props.responses.map((response) => {
                return {
                  id: response.id,
                  text: response.text.de,
                }
              }),
            },
          }
          return questionObject
        })
        .filter(Boolean)
      questions && transformedArray.push(...questions)
    }
  })

  return transformedArray
}

// @ts-expect-error: Types of property 'version' are incompatible. Type 'number' is not assignable to type '1'.
const surveyDefinitionArray: QuestionObject[] = transformJSONToArray(surveyDefinition)

type Props = {
  responseData: Record<string, Record<string, number>>
  chartType: "bar" | "pie"
}

const GroupedSurveyResponseItem: React.FC<Props> = ({ responseData, chartType }) => {
  const questionId = Object.keys(responseData)[0]
  const question = surveyDefinitionArray.find((question) => Number(questionId) === question.id)

  if (!question || !questionId) return
  const response = responseData[questionId]
  if (!response) return

  const data = Object.entries(response).map(([key, value]) => ({
    name: question?.props?.responses?.find((r) => r.id === Number(key))?.text ?? "(Missing name",
    value,
  }))

  return (
    <div className="border rounded  py-3.5">
      <H3 className="border-b pb-3.5 px-3.5">{question.label}</H3>

      <div className="h-[350px] px-3.5">
        {chartType === "bar" && <VerticalBartChart data={data} />}
        {/* <PieChartWithLegend data={recordToArray(responseData[questionId])} /> */}
      </div>
    </div>
  )
}

export default GroupedSurveyResponseItem
