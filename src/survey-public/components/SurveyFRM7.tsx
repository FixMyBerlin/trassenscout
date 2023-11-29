import { createContext, useState } from "react"
import { BlitzPage, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"

import { Survey } from "../frm7/components/Survey"
import { Feedback } from "src/survey-public/frm7/components/feedback/Feedback"

import createSurveySession from "src/survey-sessions/mutations/createSurveySession"
import updateSurveySession from "src/survey-sessions/mutations/updateSurveySession"
import createSurveyResponse from "src/survey-responses/mutations/createSurveyResponse"

import getPublicSurveyBySlug from "src/surveys/queries/getPublicSurveyBySlug"
import { Debug } from "src/survey-public/components/core/Debug"
import { ProgressContext } from "src/survey-public/components/context/contexts"
import { SurveyLayout } from "src/survey-public/components/core/layout/SurveyLayout"
import { SurveySpinnerLayover } from "src/survey-public/components/core/layout/SurveySpinnerLayover"
import { scrollToTopWithDelay } from "src/survey-public/components/utils/scrollToTopWithDelay"
import { More } from "src/survey-public/components/More"
import { Email } from "src/survey-public/components/Email"
import { Done } from "src/survey-public/components/Done"
import { surveyDefinition } from "../frm7/data/survey"
import { stageProgressDefinition } from "../frm7/data/progress"
import { feedbackDefinition } from "../frm7/data/feedback"
import { moreDefinition } from "../frm7/data/more"
import { emailDefinition } from "../frm7/data/email"

const SurveyFRM7: BlitzPage = () => {
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
        surveyPart: surveyDefinition.part,
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
        surveyPart: feedbackDefinition.part,
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
      component = <Done homeUrl={surveyDefinition.canonicalUrl} />
      break
  }

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      <SurveyLayout canonicalUrl={surveyDefinition.canonicalUrl} logoUrl={surveyDefinition.logoUrl}>
        <Debug className="border-red-500">
          <code>stage: {stage}</code>
          <code>
            <pre>{JSON.stringify(responses, null, 2)}</pre>
          </code>
          <code>email: {emailState}</code>
        </Debug>
        <div className={isSpinner ? "blur-sm" : ""}>{component}</div>
        {isSpinner && <SurveySpinnerLayover />}
      </SurveyLayout>
    </ProgressContext.Provider>
  )
}

export default SurveyFRM7
