import { useContext } from "react"
import { ProgressContext } from "src/survey-public/components/context/contexts"

export { FORM_ERROR } from "src/core/components/forms"

const TOTAL = 8

export const ProgressBar = () => {
  const { progress } = useContext(ProgressContext)
  const width = progress ? (progress / TOTAL) * 100 : 100

  return (
    <div>
      <h4 className="sr-only">Status</h4>
      <div aria-hidden="true">
        <div className="overflow-hidden bg-gray-200">
          <div className="h-1 bg-pink-500" style={{ width: `${width}%` }} />
        </div>
      </div>
    </div>
  )
}
