import clsx from "clsx"
import { useContext } from "react"
import { ProgressContext } from "src/survey-public/context/contexts"

export { FORM_ERROR } from "src/core/components/forms"

const TOTAL = 8

type Props = {
  color: "red" | "pink"
}

export const ProgressBar: React.FC<Props> = ({ color }) => {
  const { progress } = useContext(ProgressContext)
  const width = progress ? (progress / TOTAL) * 100 : 100
  const colorClass = color === "red" ? "bg-crimson-500" : "bg-pink-500"
  return (
    <div>
      <h4 className="sr-only">Status</h4>
      <div aria-hidden="true">
        <div className="overflow-hidden bg-gray-200">
          <div className={clsx("h-1", colorClass)} style={{ width: `${width}%` }} />
        </div>
      </div>
    </div>
  )
}
