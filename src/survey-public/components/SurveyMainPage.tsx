import { useMutation } from "@blitzjs/rpc"
import { useEffect, useState } from "react"

import { Email } from "src/survey-public/components/Email"
import { More } from "src/survey-public/components/More"
import { Start } from "src/survey-public/components/Start"
import { Survey } from "src/survey-public/components/Survey"
import { Debug } from "src/survey-public/components/core/Debug"
import { SurveyLayout } from "src/survey-public/components/core/layout/SurveyLayout"
import { SurveySpinnerLayover } from "src/survey-public/components/core/layout/SurveySpinnerLayover"
import { Feedback } from "src/survey-public/components/feedback/Feedback"
import { ProgressContext } from "src/survey-public/context/contexts"
import { scrollToTopWithDelay } from "src/survey-public/utils/scrollToTopWithDelay"
import surveyFeedbackEmail from "src/survey-responses/mutations/surveyFeedbackEmail"

import { useParam } from "@blitzjs/next"
import createSurveyResponse from "src/survey-responses/mutations/createSurveyResponse"
import createSurveySession from "src/survey-sessions/mutations/createSurveySession"
import {
  TEmail,
  TFeedback,
  TInstitutionsBboxes,
  TMore,
  TProgress,
  TResponseConfig,
  TSurvey,
} from "./types"

type Props = {
  startContent: React.ReactNode
  emailDefinition: TEmail
  feedbackDefinition: TFeedback
  moreDefinition: TMore
  stageProgressDefinition: TProgress
  surveyDefinition: TSurvey
  responseConfig: TResponseConfig
  surveyId: number
  // todo survey clean up or refactor after survey BB ? - initial view state of surveymapline depending on institution
  // prop institutionsBboxes might be cleaned up after BB in this and the other components it is passed through
  institutionsBboxes?: TInstitutionsBboxes
}

export const SurveyMainPage: React.FC<Props> = ({
  startContent,
  emailDefinition,
  feedbackDefinition,
  moreDefinition,
  stageProgressDefinition,
  surveyDefinition,
  responseConfig,
  surveyId,
  institutionsBboxes,
}) => {
  const [stage, setStage] = useState<"START" | "SURVEY" | "MORE" | "FEEDBACK" | "EMAIL">("START")
  const [progress, setProgress] = useState(1)
  const [isSpinner, setIsSpinner] = useState(false)
  const [responses, setResponses] = useState<any[]>([])
  const [surveySessionId, setSurveySessionId] = useState<null | number>(null)
  const [feedbackKey, setFeedbackKey] = useState(1)
  const [createSurveySessionMutation] = useMutation(createSurveySession)
  const [createSurveyResponseMutation] = useMutation(createSurveyResponse)
  const [surveyFeedbackEmailMutation] = useMutation(surveyFeedbackEmail)
  const surveySlug = useParam("surveySlug", "string")

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--survey-primary-color", surveyDefinition.primaryColor)
    root.style.setProperty("--survey-dark-color", surveyDefinition.darkColor)
    root.style.setProperty("--survey-light-color", surveyDefinition.lightColor)
  }, [surveyDefinition.darkColor, surveyDefinition.lightColor, surveyDefinition.primaryColor])

  const getOrCreateSurveySessionId = async () => {
    if (surveySessionId) {
      return surveySessionId
    } else {
      const surveySession = await createSurveySessionMutation({ surveyId })
      setSurveySessionId(surveySession.id)
      return surveySession.id
    }
  }

  const handleStart = () => {
    setStage("SURVEY")
    setProgress(stageProgressDefinition["SURVEY"])
    scrollToTopWithDelay()
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
        source: "FORM",
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
        source: "FORM",
      })
      // todo survey clean up or refactor after survey BB
      if (surveySlug === "radnetz-brandenburg")
        await surveyFeedbackEmailMutation({
          surveySessionId: surveySessionId_,
          data: feedbackResponses,
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

  let component
  switch (stage) {
    case "START":
      component = <Start onStartClick={handleStart} startContent={startContent} />
      break
    case "SURVEY":
      component = <Survey survey={surveyDefinition} onSubmit={handleSubmitSurvey} />
      break
    case "MORE":
      component = (
        <More more={moreDefinition} onClickMore={handleMoreFeedback} onClickFinish={handleFinish} />
      )
      break
    case "FEEDBACK":
      component = (
        <Feedback
          institutionsBboxes={institutionsBboxes}
          maptilerUrl={surveyDefinition.maptilerUrl}
          key={feedbackKey}
          stageProgressDefinition={stageProgressDefinition}
          feedback={feedbackDefinition}
          responseConfig={responseConfig}
          onSubmit={handleSubmitFeedback}
        />
      )
      break
    case "EMAIL":
      component = <Email email={emailDefinition} />
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
        </Debug>
        <div className={isSpinner ? "blur-sm" : ""}>{component}</div>
        {isSpinner && <SurveySpinnerLayover />}
      </SurveyLayout>
    </ProgressContext.Provider>
  )
}
