import { createContext, useState } from "react"
import { BlitzPage } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"

import { Done } from "src/participation/components/Done"
import { Email } from "src/participation/components/Email"
import { Feedback } from "src/participation/components/feedback/Feedback"
import { LayoutParticipation } from "src/participation/components/core/layout/LayoutParticipation"
import { More } from "src/participation/components/More"
import { Survey } from "src/participation/components/Survey"
import moreDefinition from "src/participation/data/more.json"
import surveyDefinition from "src/participation/data/survey.json"
import feedbackDefinition from "src/participation/data/feedback.json"
import emailDefinition from "src/participation/data/email.json"
import { ProgressContext } from "src/participation/context/contexts"
import createSurveySession from "src/survey-sessions/mutations/createSurveySession"
import updateSurveySession from "src/survey-sessions/mutations/updateSurveySession"
import createSurveyResponse from "src/survey-responses/mutations/createSurveyResponse"
import { Debug } from "src/participation/components/core/Debug"
import { scrollToTopWithDelay } from "src/participation/utils/scrollToTopWithDelay"
import { Spinner } from "src/core/components/Spinner"
import { ParticipationSpinnerLayover } from "src/participation/components/core/ParticipationSpinnerLayover"

// For Progressbar: stage and associated arbitrarily set status of the progressbar
export const stageProgressDefinition = {
  SURVEY: 1,
  MORE: 5,
  FEEDBACK: 6,
  EMAIL: 8,
  DONE: 8,
}

const ParticipationMainPage: BlitzPage = () => {
  const [stage, setStage] = useState<"SURVEY" | "MORE" | "FEEDBACK" | "EMAIL" | "DONE">("SURVEY")
  const [progress, setProgress] = useState(1)
  const [isSpinner, setIsSpinner] = useState(false)
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
      const surveySession = await createSurveySessionMutation({ surveyId: surveyDefinition.id })
      setSurveySessionId(surveySession.id)
      return surveySession.id
    }
  }

  const handleSubmitSurvey = async (surveyResponses: Record<string, any>) => {
    setIsSpinner(true)
    setResponses([...responses, surveyResponses])

    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        surveyPart: surveyDefinition.id,
        data: JSON.stringify(surveyResponses),
      })
    })()

    setTimeout(() => {
      setStage("MORE")
      setProgress(stageProgressDefinition["MORE"])
      setIsSpinner(false)
      scrollToTopWithDelay()
    }, 900)
  }

  const handleSubmitFeedback = async (
    feedbackResponses: Record<string, any>,
    submitterId: string,
  ) => {
    setIsSpinner(true)
    setResponses([...responses, feedbackResponses])

    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        surveyPart: feedbackDefinition.id,
        data: JSON.stringify(feedbackResponses),
      })
    })()

    setTimeout(() => {
      if (submitterId === "submit-finish") {
        setStage("EMAIL")
        setProgress(stageProgressDefinition["EMAIL"])
      } else {
        setFeedbackKey(feedbackKey + 1)
        setStage("FEEDBACK")
        setProgress(stageProgressDefinition["FEEDBACK"])
      }
      setIsSpinner(false)
      scrollToTopWithDelay()
    }, 900)
  }

  const handleMoreFeedback = () => {
    setFeedbackKey(feedbackKey + 1)
    setStage("FEEDBACK")
    setProgress(stageProgressDefinition["FEEDBACK"])
    scrollToTopWithDelay()
  }

  const handleFinish = () => {
    setStage("EMAIL")
    setProgress(stageProgressDefinition["EMAIL"])
    scrollToTopWithDelay()
  }

  const handleSubmitEmail = async (email: string | null) => {
    setStage("DONE")
    setProgress(stageProgressDefinition["DONE"])
    scrollToTopWithDelay()
    setEmailState(email)
    await updateSurveySessionMutation({ id: surveySessionId! })
  }

  let component
  switch (stage) {
    case "SURVEY":
      // @ts-ignore "Types of property 'version' are incompatible. / Type 'number' is not assignable to type '1'."
      component = <Survey survey={surveyDefinition} onSubmit={handleSubmitSurvey} />
      break
    case "MORE":
      component = (
        <More more={moreDefinition} onClickMore={handleMoreFeedback} onClickFinish={handleFinish} />
      )
      break
    case "FEEDBACK":
      component = (
        <Feedback key={feedbackKey} feedback={feedbackDefinition} onSubmit={handleSubmitFeedback} />
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
      <LayoutParticipation
        canonicalUrl={surveyDefinition.canonicalUrl}
        logoUrl={surveyDefinition.logoUrl}
      >
        <Debug className="border-red-500">
          <code>stage: {stage}</code>
          <code>
            <pre>{JSON.stringify(responses, null, 2)}</pre>
          </code>
          <code>email: {emailState}</code>
        </Debug>
        <div className={isSpinner ? "blur-sm" : ""}>{component}</div>
        {isSpinner && <ParticipationSpinnerLayover />}
      </LayoutParticipation>
    </ProgressContext.Provider>
  )
}

export default ParticipationMainPage
