import { BlitzPage } from "@blitzjs/next"
import { createContext, useState } from "react"
import { Done } from "src/participation/components/Done"
import { Email } from "src/participation/components/Email"
import { Feedback } from "src/participation/components/Feedback"
import { LayoutParticipation } from "src/participation/components/layout/LayoutParticipation"
import { More } from "src/participation/components/More"
import { Survey } from "src/participation/components/survey/Survey"
import moreDefinition from "src/participation/data/more.json"
import surveyDefinition from "src/participation/data/survey.json"

export const ProgressContext = createContext(null)

const ParticipationMainPage: BlitzPage = () => {
  const [stage, setStage] = useState<"SURVEY" | "MORE" | "FEEDBACK" | "EMAIL" | "DONE">("MORE")
  const [progress, setProgress] = useState({ current: 1, total: 1 })
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

  // const handleProgressChange = ({ newCurrent, newTotal }) => {
  //   setProgress({ current: newCurrent, total: newTotal })
  // }

  let component
  switch (stage) {
    case "SURVEY":
      component = <Survey survey={surveyDefinition} onSubmit={handleSubmitSurvey} />
      break
    case "FEEDBACK":
      component = <Feedback onSubmit={handleSubmitFeedback} />
      break
    case "MORE":
      component = (
        <More more={moreDefinition} onClickMore={handleMoreFeedback} onClickFinish={handleFinish} />
      )
      break
    case "EMAIL":
      component = <Email onSubmit={handleSubmitEmail} />
      break
    case "DONE":
      component = <Done />
      break
  }

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      <LayoutParticipation>
        <div className="border-red-500">
          <code>stage: {stage}</code>
          <code>
            <pre>{JSON.stringify(responses, null, 2)}</pre>
          </code>
          <code>email: {email}</code>
        </div>
        <div>{component}</div>
      </LayoutParticipation>
    </ProgressContext.Provider>
  )
}

export default ParticipationMainPage
