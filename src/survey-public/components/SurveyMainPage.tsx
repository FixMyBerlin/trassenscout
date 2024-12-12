import { Email } from "@/src/survey-public/components/Email"
import { More } from "@/src/survey-public/components/More"
import { Start } from "@/src/survey-public/components/Start"
import { Survey } from "@/src/survey-public/components/Survey"
import { Debug } from "@/src/survey-public/components/core/Debug"
import { SurveyLayout } from "@/src/survey-public/components/core/layout/SurveyLayout"
import { SurveySpinnerLayover } from "@/src/survey-public/components/core/layout/SurveySpinnerLayover"
import { Feedback } from "@/src/survey-public/components/feedback/Feedback"
import { ProgressContext } from "@/src/survey-public/context/contexts"
import { scrollToTopWithDelay } from "@/src/survey-public/utils/scrollToTopWithDelay"
import createSurveyResponse from "@/src/survey-responses/mutations/createSurveyResponse"
import surveyFeedbackEmail from "@/src/survey-responses/mutations/surveyFeedbackEmail"
import createSurveySession from "@/src/survey-sessions/mutations/createSurveySession"
import { useParam } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useEffect, useState } from "react"
import { createSurveySchema } from "../utils/createSurveySchema"
import { getBackendConfigBySurveySlug } from "../utils/getConfigBySurveySlug"
import { getQuestionsAsArray } from "../utils/getQuestionsAsArray"
import PublicSurveyForm from "./core/form/PublicSurveyForm"
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
  isStartDisabled?: boolean
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
  isStartDisabled = false,
  emailDefinition,
  feedbackDefinition,
  moreDefinition,
  stageProgressDefinition,
  surveyDefinition,
  responseConfig,
  surveyId,
  institutionsBboxes,
}) => {
  const [stage, setStage] = useState<"START" | "SURVEY" | "MORE" | "FEEDBACK" | "EMAIL">(
    process.env.NEXT_PUBLIC_PUBLIC_SURVEY_START_STAGE || "START",
  )

  // todo survey clean up or refactor after survey BB
  const surveySlug = useParam("surveySlug", "string")
  const [progress, setProgress] = useState(1)
  const [isSpinner, setIsSpinner] = useState(false)
  const [surveySessionId, setSurveySessionId] = useState<null | number>(null)
  const [feedbackKey, setFeedbackKey] = useState(1)
  const [createSurveySessionMutation] = useMutation(createSurveySession)
  const [createSurveyResponseMutation] = useMutation(createSurveyResponse)
  const [surveyFeedbackEmailMutation] = useMutation(surveyFeedbackEmail)
  const [surveyPageProgress, setSurveyPageProgress] = useState(0)
  const [isMapDirty, setIsMapDirty] = useState(false)

  const surveyFormSchema = createSurveySchema(
    getQuestionsAsArray({ definition: surveyDefinition, surveyPart: "survey" }),
  )

  const { evaluationRefs } = responseConfig
  const feedbackCategoryId = evaluationRefs["feedback-category"]
  const feedbackLocationId = evaluationRefs["feedback-location"]
  const feedbackFirstPageQuestions = feedbackDefinition.pages.find((p) => p.id === 1)!.questions
  let feedbackSecondPageQuestions = feedbackDefinition.pages
    .find((p) => p.id === 2)!
    .questions.filter((q) => q.id !== feedbackLocationId)
  const feedbackQuestions = [
    feedbackFirstPageQuestions.find((q) => q.id === feedbackCategoryId)!,
    // todo clean up or refactor after survey BB
    // for BB we have a the map for line selection on the first page - so we manually add it here for validation
    feedbackFirstPageQuestions.find((q) => q.id === 21)!,
    ...feedbackSecondPageQuestions,
  ]
  const feedbackFormSchema = createSurveySchema(feedbackQuestions)

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

  const isUserLocationQuestionId = responseConfig.evaluationRefs["is-feedback-location"]
  const userLocationQuestionId = responseConfig.evaluationRefs["feedback-location"]

  const handleStart = () => {
    setStage("SURVEY")
    setProgress(stageProgressDefinition["SURVEY"])
    scrollToTopWithDelay()
  }

  // @ts-expect-error
  const defaultStatus = getBackendConfigBySurveySlug(surveySlug).status[0].value

  const handleSurveySubmit = async (surveyResponses: Record<string, any>) => {
    setIsSpinner(true)
    surveyResponses = transformValues(surveyResponses)
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        surveyPart: surveyDefinition.part,
        data: JSON.stringify(surveyResponses),
        source: "FORM",
        status: defaultStatus,
      })
    })()

    setTimeout(() => {
      setStage("MORE")
      setProgress(stageProgressDefinition["MORE"])
      setIsSpinner(false)
      scrollToTopWithDelay()
    }, 900)
  }

  const handleFeedbackToMore = () => {
    setStage("MORE")
    setProgress(stageProgressDefinition["MORE"])
    setIsSpinner(false)
    scrollToTopWithDelay()
  }

  const handleFeedbackSubmit = async (values: Record<string, any>, submitterId?: string) => {
    if (values[`single-${isUserLocationQuestionId}`] === "2")
      values[`map-${userLocationQuestionId}`] = "" // if "no location" is chosen, set location value to empty string
    values = transformValues(values)
    delete values[isUserLocationQuestionId!] // delete map ja/nein response
    // await handleSubmitFeedback({ ...values }, submitterId)
    const feedbackResponses = { ...values }
    setIsSpinner(true)

    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        surveyPart: feedbackDefinition.part,
        data: JSON.stringify(feedbackResponses),
        source: "FORM",
        status: defaultStatus,
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

  const handleEmailToFeedback = () => {
    setFeedbackKey(feedbackKey + 1)
    setStage("FEEDBACK")
    setProgress(stageProgressDefinition["FEEDBACK"])
    scrollToTopWithDelay()
  }

  const handleMoreToFeedback = () => {
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
      component = (
        <Start disabled={isStartDisabled} onStartClick={handleStart} startContent={startContent} />
      )
      break
    case "SURVEY":
      component = (
        <Survey
          surveyPageProgressProps={{ surveyPageProgress, setSurveyPageProgress }}
          setStage={setStage}
          survey={surveyDefinition}
        />
      )
      break
    case "MORE":
      component = (
        <More
          more={moreDefinition}
          onClickMore={handleMoreToFeedback}
          onClickFinish={handleFinish}
        />
      )
      break
    case "FEEDBACK":
      component = (
        <Feedback
          institutionsBboxes={institutionsBboxes}
          maptilerUrl={surveyDefinition.maptilerUrl}
          stageProgressDefinition={stageProgressDefinition}
          feedback={feedbackDefinition}
          responseConfig={responseConfig}
          onBackClick={handleFeedbackToMore}
          setIsMapDirty={setIsMapDirty}
        />
      )
      break
    case "EMAIL":
      component = <Email email={emailDefinition} onClickMore={handleEmailToFeedback} />
      break
  }

  const transformValues = (values: Record<string, null | string | boolean>) => {
    const responses: Record<string, null | string | number | number[]> = {}
    Object.entries(values).forEach(([k, v]) => {
      const [questionType, questionId, responseId] = k.split("-")
      switch (questionType) {
        case "single":
          responses[questionId!] = v === null ? null : Number(v)
          break
        case "multi":
          if (!(questionId! in responses)) responses[questionId!] = []
          // @ts-ignore
          if (v) responses[questionId!].push(Number(responseId))
          break
        case "text":
          responses[questionId!] = v === "" ? null : String(v)
          break
        case "map":
          // @ts-expect-error
          responses[questionId!] = v === "" ? null : { lng: v?.lng, lat: v?.lat }
          break
        case "custom":
          responses[questionId!] = v === "" ? null : String(v)
          break
      }
    })
    return responses
  }

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      <SurveyLayout canonicalUrl={surveyDefinition.canonicalUrl} logoUrl={surveyDefinition.logoUrl}>
        <Debug className="border border-red-500">
          <code>stage: {stage}</code>
        </Debug>
        <div className={isSpinner ? "blur-sm" : ""}>
          {stage === "START" || stage === "SURVEY" ? (
            <PublicSurveyForm
              schema={surveyFormSchema}
              // key is necessary to reset form state when switching between survey and feedback part
              key={1}
              onSubmit={handleSurveySubmit}
            >
              {component}
            </PublicSurveyForm>
          ) : (
            <PublicSurveyForm
              // feedback key / updating the key is necessary to reset form state when feedback part is filled out multiple times
              key={2 + feedbackKey}
              schema={feedbackFormSchema}
              onSubmit={handleFeedbackSubmit}
            >
              {component}
            </PublicSurveyForm>
          )}
        </div>
        {isSpinner && <SurveySpinnerLayover />}
      </SurveyLayout>
    </ProgressContext.Provider>
  )
}
