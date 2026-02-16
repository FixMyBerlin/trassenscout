"use client"

import { Debug } from "@/src/app/beteiligung/_components/Debug"
import { SurveyEnd } from "@/src/app/beteiligung/_components/End"
import { ProgressBar } from "@/src/app/beteiligung/_components/layout/ProgressBar"
import { SurveyContainer } from "@/src/app/beteiligung/_components/layout/SurveyContainer"
import { SurveySpinnerLayover } from "@/src/app/beteiligung/_components/layout/SurveySpinnerLayover"
import { SurveyPart } from "@/src/app/beteiligung/_components/SurveyPart"
import { ProgressContext } from "@/src/app/beteiligung/_shared/contexts/contexts"
import { Stage } from "@/src/app/beteiligung/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import {
  getConfigBySurveySlug,
  getprogressBarDefinitionBySurveySlug,
} from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { scrollToTopWithDelay } from "@/src/app/beteiligung/_shared/utils/scrollToTopWithDelay"
import getOrCreateCreatedSurveyResponsePublic from "@/src/server/survey-responses/mutations/getOrCreateCreatedSurveyResponsePublic"
import surveyFeedbackEmail from "@/src/server/survey-responses/mutations/surveyPart2Email"
import updateSurveyResponsePublic from "@/src/server/survey-responses/mutations/updateSurveyResponsePublic"
import createSurveySession from "@/src/server/survey-sessions/mutations/createSurveySession"
import { useMutation } from "@blitzjs/rpc"
import { useParams, useSearchParams } from "next/navigation"
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
    process.env.NEXT_PUBLIC_PUBLIC_SURVEY_START_STAGE || getFirstStage(surveySlug),
  )
  const [isSpinner, setIsSpinner] = useState(false)
  const [surveySessionId, setSurveySessionId] = useState<null | number>(null)
  const [createSurveySessionMutation] = useMutation(createSurveySession)
  const [getOrCreateCreatedSurveyResponseMutation] = useMutation(
    getOrCreateCreatedSurveyResponsePublic,
  )
  const [updateSurveyResponsePublicMutation] = useMutation(updateSurveyResponsePublic)
  const [surveyPart2EmailMutation] = useMutation(surveyFeedbackEmail)
  // to reset form when repeated
  const [formKey, setFormKey] = useState(1)
  const searchParams = useSearchParams()
  const allParams = searchParams ? Object.fromEntries(searchParams.entries()) : null

  // Track response IDs per part
  const [responseIdByPart, setResponseIdByPart] = useState<Record<1 | 2 | 3, number | null>>({
    1: null,
    2: null,
    3: null,
  })

  const [progress, setProgress] = useState(getprogressBarDefinitionBySurveySlug(surveySlug, stage))

  const getOrCreateSurveySessionId = async () => {
    if (surveySessionId) {
      return surveySessionId
    } else {
      const { id } = await createSurveySessionMutation({ surveyId })
      setSurveySessionId(id)
      return id
    }
  }

  const backendConfig = getConfigBySurveySlug(surveySlug, "backend")
  const surveyResponseDefaultStatus = backendConfig.status[0].value

  // Create a (CREATED) response when starting a part
  const createPendingResponse = async (part: 1 | 2 | 3) => {
    const surveySessionId_ = await getOrCreateSurveySessionId()
    const { id } = await getOrCreateCreatedSurveyResponseMutation({
      surveySessionId: surveySessionId_,
      surveyPart: part,
      data: "{}",
      source: "FORM",
      status: surveyResponseDefaultStatus,
    })
    setResponseIdByPart((prev) => ({ ...prev, [part]: id }))
    return id
  }

  // Update response to SUBMITTED on submit
  const updateResponseSubmitted = async ({
    id,
    surveySessionId: sessionId,
    value,
  }: {
    id: number
    surveySessionId: number
    value: unknown
  }) => {
    const response = await updateSurveyResponsePublicMutation({
      id,
      surveySessionId: sessionId,
      data: JSON.stringify(value),
      state: "SUBMITTED",
    })
  }

  // @ts-expect-error todo
  const handleSurveyPart1Submit = async ({ value, meta }) => {
    setIsSpinner(true)
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await updateResponseSubmitted({
        id: meta.surveyResponseId,
        surveySessionId: surveySessionId_,
        value,
      })
    })()
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
    // if the user selected "nein" ("2" in legacy surveys) in the enableLocation-location question, we need to delete the location field from the value object
    const enableLocationId = getQuestionIdBySurveySlug(surveySlug, "enableLocation")
    const locationId = getQuestionIdBySurveySlug(surveySlug, "location")
    if (value[enableLocationId] === "nein" || String(value[enableLocationId]) === "2")
      delete value[locationId]
    // tbd null or delete?
    // delete value.enableLocation
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await updateResponseSubmitted({
        id: meta.surveyResponseId,
        surveySessionId: surveySessionId_,
        value,
      })
      await surveyPart2EmailMutation({
        surveySessionId: surveySessionId_,
        data: value,
        surveySlug,
        searchParams: allParams,
      })
      // If part2 is repeated, create a new pending (CREATED) response immediately
      if (meta.again) {
        await createPendingResponse(2)
      }
    })()
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
  const handleSurveyPart3Submit = async ({ value, meta }) => {
    setIsSpinner(true)
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await updateResponseSubmitted({
        id: meta.surveyResponseId,
        surveySessionId: surveySessionId_,
        value,
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

  // Handler for when a part starts (called from SurveyPart)
  const handleStartPart = async (part: 1 | 2 | 3) => {
    await createPendingResponse(part)
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
          surveyResponseId={responseIdByPart[1]}
          surveySessionId={surveySessionId}
          onStartPart={() => handleStartPart(1)}
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
          surveyResponseId={responseIdByPart[2]}
          surveySessionId={surveySessionId}
          onStartPart={() => handleStartPart(2)}
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
          surveyResponseId={responseIdByPart[3]}
          surveySessionId={surveySessionId}
          onStartPart={() => handleStartPart(3)}
        />
      )
      break
    case "end":
      component = <SurveyEnd setStage={setStage} />
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
          <br />
          <code>surveySessionId: {surveySessionId ?? "null"}</code>
          <br />
          <code>responseIdByPart: {JSON.stringify(responseIdByPart, null, 2)}</code>
        </Debug>
        <div className={isSpinner ? "blur-sm" : ""}>{component}</div>
        {isSpinner && <SurveySpinnerLayover />}
      </SurveyContainer>
    </ProgressContext.Provider>
  )
}
