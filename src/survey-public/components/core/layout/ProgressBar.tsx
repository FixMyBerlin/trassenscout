import { ProgressContext } from "@/src/survey-public/context/contexts"
import { clsx } from "clsx"
import { useContext } from "react"

export const ProgressBar = () => {
  const TOTAL = 8
  const { progress } = useContext(ProgressContext)
  const width = progress ? (progress / TOTAL) * 100 : 100

  return (
    <div>
      <h4 className="sr-only">Status</h4>
      <div aria-hidden="true">
        <div className="overflow-hidden bg-gray-200">
          <div
            className={clsx("h-3 bg-[var(--survey-primary-color)]")}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    </div>
  )
}
