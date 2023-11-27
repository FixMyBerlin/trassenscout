import { createContext, useState } from "react"
import { BlitzPage, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"

import { Done } from "src/participation-frm7/components/Done"

import { Feedback } from "src/participation-frm7/components/feedback/Feedback"

import { Survey } from "src/participation-frm7/components/Survey"
import moreDefinition from "src/participation-frm7/data/more.json"
import surveyDefinition from "src/participation-frm7/data/survey.json"
import feedbackDefinition from "src/participation-frm7/data/feedback.json"
import emailDefinition from "src/participation-frm7/data/email.json"

import createSurveySession from "src/survey-sessions/mutations/createSurveySession"
import updateSurveySession from "src/survey-sessions/mutations/updateSurveySession"
import createSurveyResponse from "src/survey-responses/mutations/createSurveyResponse"

import getPublicSurveyBySlug from "src/surveys/queries/getPublicSurveyBySlug"
import { Debug } from "src/participation/components/core/Debug"
import { ProgressContext } from "src/participation/context/contexts"
import { LayoutParticipation } from "src/participation/components/core/layout/LayoutParticipation"
import { ParticipationSpinnerLayover } from "src/participation/components/core/ParticipationSpinnerLayover"
import { scrollToTopWithDelay } from "src/participation/utils/scrollToTopWithDelay"
import { More } from "src/participation/components/core/More"
import { Email } from "src/participation/components/core/Email"

// For Progressbar: stage and associated arbitrarily set status of the progressbar
export const stageProgressDefinition = {
  SURVEY: 1,
  MORE: 5,
  FEEDBACK: 6,
  EMAIL: 8,
  DONE: 8,
}

const ParticipationFrm7MainPage: BlitzPage = () => {
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
  const surveySlug = useParam("surveySlug", "string")
  const [survey] = useQuery(getPublicSurveyBySlug, { slug: surveySlug! })

  const getOrCreateSurveySessionId = async () => {
    if (surveySessionId) {
      return surveySessionId
    } else {
      const surveySession = await createSurveySessionMutation({ surveyId: survey.id })
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
      component = (
        <Email
          email={emailDefinition}
          onSubmit={handleSubmitEmail}
          homeUrl={surveyDefinition.canonicalUrl}
        />
      )
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

export default ParticipationFrm7MainPage
