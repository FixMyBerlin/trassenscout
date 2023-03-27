import { useContext } from "react"
import { ProgressContext } from "src/participation/context/contexts"

export { FORM_ERROR } from "src/core/components/forms"

export const ProgressBar = () => {
  const { progress } = useContext(ProgressContext)
  const width = (progress.current / progress.total) * 100
  console.log(progress)
  // const width = 100
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
