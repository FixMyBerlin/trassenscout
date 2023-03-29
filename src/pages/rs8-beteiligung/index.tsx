import { createContext, useState } from "react"
import { BlitzPage } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"

import { Done } from "src/participation/components/Done"
import { Email } from "src/participation/components/Email"
import { Feedback } from "src/participation/components/feedback/Feedback"
import { LayoutParticipation } from "src/participation/components/layout/LayoutParticipation"
import { More } from "src/participation/components/More"
import { Survey } from "src/participation/components/survey/Survey"
import moreDefinition from "src/participation/data/more.json"
import surveyDefinition from "src/participation/data/survey.json"
import feedbackDefinition from "src/participation/data/feedback.json"
import emailDefinition from "src/participation/data/email.json"
import { ProgressContext } from "src/participation/context/contexts"
import createSurveySession from "src/survey-sessions/mutations/createSurveySession"
import updateSurveySession from "src/survey-sessions/mutations/updateSurveySession"
import createSurveyResponse from "src/survey-responses/mutations/createSurveyResponse"

const ParticipationMainPage: BlitzPage = () => {
  const [stage, setStage] = useState<"SURVEY" | "MORE" | "FEEDBACK" | "EMAIL" | "DONE">("SURVEY")
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [responses, setResponses] = useState<any[]>([])
  const [emailState, setEmailState] = useState<string | null>()
  const [surveySessionId, setSurveySessionId] = useState<null | number>(null)
  const [feedbackKey, setFeedbackKey] = useState(1)
  const [createSurveySessionMutation] = useMutation(createSurveySession)
  const [updateSurveySessionMutation] = useMutation(updateSurveySession)
  const [createSurveyResponseMutation] = useMutation(createSurveyResponse)

  const getOrCreateSurveySessionId = async () => {
    if (surveySessionId) {
      return surveySessionId
    } else {
      const surveySession = await createSurveySessionMutation({})
      setSurveySessionId(surveySession.id)
      return surveySession.id
    }
  }

  const handleSubmitSurvey = async (surveyResponses: Record<string, any>) => {
    setResponses([...responses, surveyResponses])
    setStage("MORE")
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        surveyId: surveyDefinition.id,
        data: JSON.stringify(surveyResponses),
      })
    })()
  }

  const handleSubmitFeedback = async (feedbackResponses: Record<string, any>, submitterId: string) => {
    setResponses([...responses, feedbackResponses])
    if (submitterId === "submit-finish") {
      setStage("EMAIL")
    } else {
      setFeedbackKey(feedbackKey + 1)
      setStage("FEEDBACK")
    }
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        surveyId: feedbackDefinition.id,
        data: JSON.stringify(feedbackResponses),
      })
    })()
  }

  const handleMoreFeedback = () => {
    setFeedbackKey(feedbackKey + 1)
    setStage("FEEDBACK")
  }

  const handleFinish = () => {
    setStage("EMAIL")
  }

  const handleSubmitEmail = async (email: string | null) => {
    setStage("DONE")
    setEmailState(email)
    await updateSurveySessionMutation({ id: surveySessionId!, email: email! })
    // TODO --> zur RS8 Seite /beteiligung weiterleiten
  }

  let component
  switch (stage) {
    case "SURVEY":
      component = <Survey survey={surveyDefinition} onSubmit={handleSubmitSurvey} />
      break
    case "FEEDBACK":
      component = (
        <Feedback key={feedbackKey} feedback={feedbackDefinition} onSubmit={handleSubmitFeedback} />
      )
      break
    case "MORE":
      component = (
        <More more={moreDefinition} onClickMore={handleMoreFeedback} onClickFinish={handleFinish} />
      )
      break
    case "EMAIL":
      component = <Email email={emailDefinition} onSubmit={handleSubmitEmail} />
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
          <code>email: {emailState}</code>
        </div>
        <div>{component}</div>
      </LayoutParticipation>
    </ProgressContext.Provider>
  )
}

export default ParticipationMainPage
