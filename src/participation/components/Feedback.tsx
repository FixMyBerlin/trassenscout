export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onSubmit: any
}

export const Feedback: React.FC<Props> = ({ onSubmit }) => {
  const handleSubmit = () => {
    onSubmit({ feed: "back" })
  }

  return (
    <div>
      <h1>Feedback</h1>
      <div>
        <button className="m-2 border-2 p-2" onClick={handleSubmit}>
          OK
        </button>
      </div>
    </div>
  )
}
