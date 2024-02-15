import clsx from "clsx"
import { H3 } from "src/core/components/text"
import { BarChart } from "./BarChart"
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
  if (!responseData?.length) return

  let heightClass: string

  switch (true) {
    case responseData.length <= 3:
      heightClass = "h-[220px]"
      break
    case responseData.length <= 4:
      heightClass = "h-[290px]"
      break
    case responseData.length <= 6:
      heightClass = "h-[300px]"
      break
    case responseData.length <= 8:
      heightClass = "h-[600px]"
      break
    default:
      heightClass = "h-[700px]"
  }
  return (
    <div className="border rounded  py-3.5">
      {questionLabel && <H3 className="border-b pb-3.5 px-3.5">{questionLabel}</H3>}

      <div className={clsx("h-[480px] px-3.5", heightClass)}>
        {chartType === "bar" && <BarChart data={responseData} />}
        {/* <PieChart data={responseData} /> */}
      </div>
    </div>
  )
}
