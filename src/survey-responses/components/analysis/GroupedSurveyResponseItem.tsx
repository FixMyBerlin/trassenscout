import { H3 } from "@/src/core/components/text"
import { clsx } from "clsx"
import { BarChart } from "./BarChart"

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
    case responseData.length <= 5:
      heightClass = "h-[360px]"
      break
    case responseData.length <= 6:
      heightClass = "h-[400px]"
      break
    case responseData.length <= 8:
      heightClass = "h-[550px]"
      break
    default:
      heightClass = "h-[650px]"
  }
  return (
    <div className="rounded-sm border border-gray-200 py-3.5">
      {questionLabel && <H3 className="border-b border-gray-200 px-3.5 pb-3.5">{questionLabel}</H3>}

      <div className={clsx("px-3.5", heightClass)}>
        {chartType === "bar" && <BarChart data={responseData} />}
        {/* <PieChart data={responseData} /> */}
      </div>
    </div>
  )
}
