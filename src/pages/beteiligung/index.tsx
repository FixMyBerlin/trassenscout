import { BlitzPage } from "@blitzjs/next"
import { Survey } from "src/participation/components/survey/Survey"
import surveyDefinition from "src/participation/data/survey.json"
import { useState } from "react"
import { Feedback } from "src/participation/components/Feedback"
import { More } from "src/participation/components/More"
import { Email } from "src/participation/components/Email"
import { Done } from "src/participation/components/Done"

const ParticipationMainPage: BlitzPage = () => {
  const [stage, setStage] = useState<"SURVEY" | "MORE" | "FEEDBACK" | "EMAIL" | "DONE">("FEEDBACK")
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
      component = <Survey survey={surveyDefinition} onSubmit={handleSubmitSurvey} />
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
      component = <Done />
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
