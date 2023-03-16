export { FORM_ERROR } from "src/core/components/forms"

export type TProgress = {
  progress: { current: number; total: number }
}

export const ProgressBar: React.FC<TProgress> = ({ progress }) => {
  const width = (progress.current / progress.total) * 100
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
