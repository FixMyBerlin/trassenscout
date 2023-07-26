import surveyDefinition from "src/participation/data/survey.json"
import VerticalBartChart from "./BarChart"
import PieChartWithLegend from "./PieChart"
import { H3 } from "src/core/components/text"
export { FORM_ERROR } from "src/core/components/forms"

const data = [
  {
    name: "ohne Einschränkung mit dem Rad nutzen.",
    "Anzahl der Antworten": 132,
  },
  { name: "eher selten mit dem Rad nutzen.", "Anzahl der Antworten": 191 },
  { name: "nie mit dem Rad nutzen.", "Anzahl der Antworten": 73 },
  { name: "Weiß ich nicht.", "Anzahl der Antworten": 10 },
]

function transformJSONToArray(json) {
  const pages = json.pages

  const transformedArray = []

  pages.forEach((page) => {
    // Check if the page has questions
    if (page.questions && page.questions.length > 0) {
      const questions = page.questions.map((question) => {
        const questionObject = {
          id: question.id,
          label: question.label.de,
          component: question.component,
          props: {
            responses: question.props.responses.map((response) => {
              const responseObject = {
                id: response.id,
                text: response.text.de,
              }
              return responseObject
            }),
          },
        }
        return questionObject
      })

      transformedArray.push(...questions)
    }
  })

  return transformedArray
}

const surveyDefinitionArray = transformJSONToArray(surveyDefinition)

type Props = {
  responseData: Record<string, Record<string, number>>
  chartType: "bar" | "pie"
}

const GroupedSurveyResponseItem: React.FC<Props> = ({ responseData, chartType }) => {
  const questionId = Object.keys(responseData)[0]
  const question = surveyDefinitionArray.find((question) => Number(questionId) === question.id)

  const getSurveyQuestion = (id: string) => {
    return question.label
  }
  const recordToArray = (record: Record<string, number>) => {
    return Object.entries(record).map(([key, value]) => ({
      name: question.props.responses.find((r) => r.id === Number(key)).text,
      value,
    }))
  }

  // console.log(recordToArray(responseData[questionId]))

  return (
    <div className="border rounded  py-3.5">
      <H3 className="border-b pb-3.5 px-3.5">
        {getSurveyQuestion(Object.keys(responseData)[0] as string)}
      </H3>

      <div className="h-[350px] px-3.5">
        {chartType === "bar" && (
          <VerticalBartChart data={recordToArray(responseData[questionId])} />
        )}
        {/* <PieChartWithLegend data={recordToArray(responseData[questionId])} /> */}
      </div>
    </div>
  )
}

export default GroupedSurveyResponseItem
