import { H3 } from "src/core/components/text"
import { BarChart } from "./BarChart"
import { PieChart } from "./PieChart"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  responseData: { name: string; value: number }[] | undefined
  chartType: "bar" | "pie"
  questionLabel: string | undefined
}

export const GroupedSurveyResponseItem: React.FC<Props> = ({
  questionLabel,
  responseData,
  chartType,
}) => {
  if (!responseData) return

  return (
    <div className="border rounded  py-3.5">
      {questionLabel && <H3 className="border-b pb-3.5 px-3.5">{questionLabel}</H3>}

      <div className="h-[350px] px-3.5">
        {chartType === "bar" && <BarChart data={responseData} />}
        {/* <PieChart data={responseData} /> */}
      </div>
    </div>
  )
}
