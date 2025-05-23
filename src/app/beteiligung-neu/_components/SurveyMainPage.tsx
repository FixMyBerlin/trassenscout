"use client"

import { SurveyEnd } from "@/src/app/beteiligung-neu/_components/End"
import { ProgressBar } from "@/src/app/beteiligung-neu/_components/layout/ProgressBar"
import { SurveyContainer } from "@/src/app/beteiligung-neu/_components/layout/SurveyContainer"
import { SurveyPart } from "@/src/app/beteiligung-neu/_components/SurveyPart"
import { ProgressContext } from "@/src/app/beteiligung-neu/_shared/contexts/contexts"
import { Stage } from "@/src/app/beteiligung-neu/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import {
  getConfigBySurveySlug,
  getprogressBarDefinitionBySurveySlug,
} from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"

import { Debug } from "@/src/survey-public/components/core/Debug"
import { SurveySpinnerLayover } from "@/src/survey-public/components/core/layout/SurveySpinnerLayover"
import { scrollToTopWithDelay } from "@/src/survey-public/utils/scrollToTopWithDelay"
import createSurveyResponse from "@/src/survey-responses/mutations/createSurveyResponse"
import createSurveySession from "@/src/survey-sessions/mutations/createSurveySession"

import { useMutation } from "@blitzjs/rpc"
import { useParams } from "next/navigation"
import { useState } from "react"

type Props = {
  surveyId: number
}

const getNextStage = (surveySlug: AllowedSurveySlugs, currentStage: number): Stage => {
  for (let i = currentStage + 1; i <= 3; i++) {
    // @ts-expect-error
    const config = getConfigBySurveySlug(surveySlug, `part${i}`)
    if (config) {
      return `part${i}` as Stage
    }
  }
  return "end"
}
const getFirstStage = (surveySlug: AllowedSurveySlugs): Stage => {
  return getNextStage(surveySlug, 0)
}

export const SurveyMainPage = ({ surveyId }: Props) => {
  const [isIntro, setIsIntro] = useState(true)
  const surveySlug = useParams()?.surveySlug as AllowedSurveySlugs
  const [stage, setStage] = useState<Stage>(
    process.env.NEXT_PUBLIC_PUBLIC_SURVEY_START_STAGE_NEW || getFirstStage(surveySlug),
  )
  const [isSpinner, setIsSpinner] = useState(false)
  const [surveySessionId, setSurveySessionId] = useState<null | number>(null)
  const [createSurveySessionMutation] = useMutation(createSurveySession)
  const [createSurveyResponseMutation] = useMutation(createSurveyResponse)
  // to reset form when repeated
  const [formKey, setFormKey] = useState(1)

  const [progress, setProgress] = useState(getprogressBarDefinitionBySurveySlug(surveySlug, stage))

  const getOrCreateSurveySessionId = async () => {
    if (surveySessionId) {
      return surveySessionId
    } else {
      const surveySession = await createSurveySessionMutation({ surveyId })
      setSurveySessionId(surveySession.id)
      return surveySession.id
    }
  }

  const backendConfig = getConfigBySurveySlug(surveySlug, "backend")
  const surveyResponseDefaultStatus = backendConfig.status[0].value

  // @ts-expect-error todo
  const handleSurveyPart1Submit = async ({ value }) => {
    setIsSpinner(true)
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        surveyPart: 1,
        data: JSON.stringify(value),
        source: "FORM",
        status: surveyResponseDefaultStatus,
      })
    })()
    console.log({ value })
    const nextStage = getNextStage(surveySlug, 1)
    setTimeout(() => {
      setStage(nextStage)
      setIsSpinner(false)
      setIsIntro(true)
      scrollToTopWithDelay()
      setProgress(getprogressBarDefinitionBySurveySlug(surveySlug, nextStage))
    }, 900)
  }
  // @ts-expect-error todo
  const handleSurveyPart2Submit = async ({ value, meta }) => {
    setIsSpinner(true)
    if (value.enableLocation === "nein") delete value.location
    // tbd null or delete?
    // delete value.enableLocation
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        surveyPart: 2,
        data: JSON.stringify(value),
        source: "FORM",
        status: surveyResponseDefaultStatus,
      })
    })()
    console.log({ value })
    const nextStage = getNextStage(surveySlug, 2)
    // depending on meta (coming from submit button) repeat part2 or go to next existing stage
    const newStage = meta.again ? "part2" : nextStage
    // if part2 is repeated we need to set intro to false and reset the form
    const newIntroState = !meta.again
    setFormKey(formKey + 1)
    setTimeout(() => {
      setStage(newStage)
      setIsSpinner(false)
      setIsIntro(newIntroState)
      scrollToTopWithDelay()
      setProgress(getprogressBarDefinitionBySurveySlug(surveySlug, newStage))
    }, 900)
  }
  // @ts-expect-error todo
  const handleSurveyPart3Submit = async ({ value }) => {
    setIsSpinner(true)
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        surveyPart: 3,
        data: JSON.stringify(value),
        source: "FORM",
        status: surveyResponseDefaultStatus,
      })
    })()
    console.log({ value })
    setTimeout(() => {
      setStage("end")
      setIsSpinner(false)
      setIsIntro(true)
      scrollToTopWithDelay()
      setProgress(getprogressBarDefinitionBySurveySlug(surveySlug, "end"))
    }, 900)
  }

  let component
  switch (stage) {
    case "part1":
      component = (
        <SurveyPart
          isIntro={isIntro}
          setIsIntro={setIsIntro}
          setStage={setStage}
          stage="part1"
          handleSubmit={handleSurveyPart1Submit}
        />
      )
      break
    case "part2":
      component = (
        <SurveyPart
          // reset form when repeated
          key={formKey + 1}
          isIntro={isIntro}
          setIsIntro={setIsIntro}
          setStage={setStage}
          stage="part2"
          handleSubmit={handleSurveyPart2Submit}
        />
      )
      break
    case "part3":
      component = (
        <SurveyPart
          isIntro={isIntro}
          setIsIntro={setIsIntro}
          setStage={setStage}
          stage="part3"
          handleSubmit={handleSurveyPart3Submit}
        />
      )
      break
    case "end":
      component = <SurveyEnd />
      break
  }

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      <ProgressBar />
      <SurveyContainer>
        <Debug className="border border-red-500">
          <code>stage: {stage}</code>
          <br />
          <code>progressbar: {progress}</code>
        </Debug>
        <div className={isSpinner ? "blur-sm" : ""}>{component}</div>
        {isSpinner && <SurveySpinnerLayover />}
      </SurveyContainer>
    </ProgressContext.Provider>
  )
}
