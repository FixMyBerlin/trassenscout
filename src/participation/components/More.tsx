export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onClickMore: any
  onClickFinish: any
}

export const More: React.FC<Props> = ({ onClickMore, onClickFinish }) => {
  return (
    <div>
      <h1>Feedback</h1>
      <div>
        <button className="m-2 border-2 p-2" onClick={onClickMore}>
          More Feedback
        </button>
        <button className="m-2 border-2 p-2" onClick={onClickFinish}>
          Finish
        </button>
      </div>
    </div>
  )
}
