import { Page } from "@/src/survey-public/components/Page"
import { Debug } from "@/src/survey-public/components/core/Debug"
import { TSurvey } from "@/src/survey-public/components/types"
import { ProgressContext } from "@/src/survey-public/context/contexts"
import { scrollToTopWithDelay } from "@/src/survey-public/utils/scrollToTopWithDelay"
import { SetStateAction, useContext } from "react"
import { useFormContext } from "react-hook-form"
import { stageProgressDefinition } from "../frm7/data/progress"
import { useAlertBeforeUnload } from "../utils/useAlertBeforeUnload"

type Props = {
  survey: TSurvey
  setStage: (value: SetStateAction<"SURVEY" | "MORE" | "FEEDBACK" | "EMAIL" | "START">) => void
  surveyPageProgressProps: {
    surveyPageProgress: number
    setSurveyPageProgress: (value: SetStateAction<number>) => void
  }
}

export const Survey = ({
  survey,
  setStage,
  surveyPageProgressProps: { surveyPageProgress, setSurveyPageProgress },
}: Props) => {
  const { setProgress } = useContext(ProgressContext)

  useAlertBeforeUnload()

  const {
    // for debugging
    getValues,
  } = useFormContext()
  const responsesForDebugging = getValues()

  const handleNextPage = () => {
    const newSurveyPageProgress = Math.min(survey.pages.length, surveyPageProgress + 1)
    setSurveyPageProgress(newSurveyPageProgress)
    setProgress(stageProgressDefinition["SURVEY"] + newSurveyPageProgress)
    scrollToTopWithDelay()
  }

  const handleBackPage = () => {
    if (surveyPageProgress === 0) {
      setStage("START")
    } else {
      const newSurveyPageProgress = Math.max(0, surveyPageProgress - 1)
      setSurveyPageProgress(newSurveyPageProgress)
      setProgress(stageProgressDefinition["SURVEY"] + newSurveyPageProgress)
    }
    scrollToTopWithDelay()
  }

  const buttonActions = {
    next: handleNextPage,
    back: handleBackPage,
  }

  const { pages } = survey

  const page = pages[surveyPageProgress]

  return (
    <>
      <Debug className="border-red-500">
        <code>
          <pre>{JSON.stringify(responsesForDebugging, null, 2)}</pre>
        </code>
      </Debug>
      {page && <Page page={page} buttonActions={buttonActions} />}
    </>
  )
}
