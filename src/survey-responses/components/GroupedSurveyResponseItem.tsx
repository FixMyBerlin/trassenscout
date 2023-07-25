import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { FormProps } from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"
import surveyDefinition from "src/participation/data/survey.json"

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
              if (response.help) {
                responseObject.help = response.help.de
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
  chartType: string
}

const GroupedSurveyResponseItem: React.FC<Props> = ({ responseData, chartType }) => {
  const getSurveyQuestion = (id: string) => {
    const question = surveyDefinitionArray.find((question) => Number(id) === question.id)
    return question.label
  }

  return (
    <>
      <h1 style={{ fontFamily: "Overpass" }}>
        {getSurveyQuestion(Object.keys(responseData)[0] as string)}
      </h1>
      <ResponsiveContainer width="100%" height={480}>
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <YAxis dataKey="name" width={100} type="category" tick={{ fontFamily: "Overpass" }} />
          <XAxis tick={{ fontFamily: "Overpass" }} type="number" stroke={"0"} />
          <CartesianGrid horizontal={false} />
          <Tooltip
            wrapperStyle={{
              fontFamily: "Overpass",
            }}
            labelStyle={{
              color: "#E5007D",
            }}
            itemStyle={{
              color: "#E5007D",
            }}
            separator=": "
            isAnimationActive={false}
            contentStyle={{ width: "100%" }}
          />
          <Bar background={false} fill="#2C62A9" dataKey="Anzahl der Antworten" />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export default GroupedSurveyResponseItem
