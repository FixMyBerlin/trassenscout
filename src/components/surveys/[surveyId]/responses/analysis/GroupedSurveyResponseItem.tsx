import { twJoin } from "tailwind-merge"
import { H3 } from "@/src/components/core/components/text/Headings"
import { BarChart } from "./BarChart"

type Props = {
  responseData: { name: string; value: number }[] | undefined
  questionLabel: string | undefined
}

export const GroupedSurveyResponseItem: React.FC<Props> = ({ questionLabel, responseData }) => {
  if (!responseData?.length) return

  const count = responseData.length
  const heightClass =
    count <= 3
      ? "h-[220px]"
      : count <= 4
        ? "h-[290px]"
        : count <= 5
          ? "h-[360px]"
          : count <= 6
            ? "h-[400px]"
            : count <= 8
              ? "h-[550px]"
              : "h-[650px]"
  return (
    <div className="rounded-sm border border-gray-200 py-3.5">
      {questionLabel && <H3 className="border-b border-gray-200 px-3.5 pb-3.5">{questionLabel}</H3>}

      <div className={twJoin("px-3.5", heightClass)}>
        <BarChart data={responseData} />
      </div>
    </div>
  )
}
