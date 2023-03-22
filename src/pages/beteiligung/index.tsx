import { BlitzPage } from "@blitzjs/next"
import { Survey } from "src/participation/components/Survey"
import surveyDefinition from "src/participation/data/survey.json"
import { useState } from "react"

const Feedback = ({ onSubmit }) => {
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

const More = ({ onClickMore, onClickFinish }) => {
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

const Email = ({ onSubmit }) => {
  const handleSubmit = () => {
    onSubmit("john@example.com")
  }
  return (
    <div>
      <h1>Email</h1>
      <div>
        {/*<input type="text" name="" id="" />*/}
        <button className="m-2 border-2 p-2" onClick={handleSubmit}>
          Send
        </button>
      </div>
    </div>
  )
}

const ParticipationMainPage: BlitzPage = () => {
  const [stage, setStage] = useState<"SURVEY" | "MORE" | "FEEDBACK" | "EMAIL" | "DONE">("MORE")
  const [responses, setResponses] = useState<any[]>([])
  const [email, setEmail] = useState<string | null>()

  const handleSubmitSurvey = (surveyResponses: []) => {
    setResponses([...responses, ...surveyResponses])
    setStage("MORE")
  }

  const handleSubmitFeedback = (feedback: {}) => {
    setResponses([...responses, feedback])
    setStage("MORE")
  }

  const handleMoreFeedback = () => {
    setStage("FEEDBACK")
  }

  const handleFinish = () => {
    setStage("EMAIL")
  }

  const handleSubmitEmail = (email: string | null) => {
    console.log("#################### SUBMIT ####################")
    console.log("responses:", responses)
    console.log("email:", email)
    setStage("DONE")
    setEmail(email)
  }

  let component
  switch (stage) {
    case "SURVEY":
      component = <Survey survey={surveyDefinition} handleSubmit={handleSubmitSurvey} />
      break
    case "FEEDBACK":
      component = <Feedback onSubmit={handleSubmitFeedback} />
      break
    case "MORE":
      component = <More onClickMore={handleMoreFeedback} onClickFinish={handleFinish} />
      break
    case "EMAIL":
      component = <Email onSubmit={handleSubmitEmail} />
      break
    case "DONE":
      component = <h1>Done</h1>
      break
  }

  return (
    <div>
      <div className="border-red-500">
        <code>stage: {stage}</code>
        <code>
          <pre>{JSON.stringify(responses, null, 2)}</pre>
        </code>
        <code>email: {email}</code>
      </div>
      <div>{component}</div>
    </div>
  )
}

export default ParticipationMainPage
