"use client"

import { SurveyEnd } from "@/src/app/beteiligung-new/_components/End"
import { ProgressBar } from "@/src/app/beteiligung-new/_components/layout/ProgressBar"
import { SurveyContainer } from "@/src/app/beteiligung-new/_components/layout/SurveyContainer"
import { SurveyPart } from "@/src/app/beteiligung-new/_components/SurveyPart"
import { ProgressContext } from "@/src/app/beteiligung-new/_shared/contexts/contexts"
import { Stage } from "@/src/app/beteiligung-new/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung-new/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung-new/_shared/utils/getConfigBySurveySlug"

import { Debug } from "@/src/survey-public/components/core/Debug"
import { SurveySpinnerLayover } from "@/src/survey-public/components/core/layout/SurveySpinnerLayover"
import { scrollToTopWithDelay } from "@/src/survey-public/utils/scrollToTopWithDelay"
import createSurveyResponse from "@/src/survey-responses/mutations/createSurveyResponse"
import createSurveySession from "@/src/survey-sessions/mutations/createSurveySession"

import { useMutation } from "@blitzjs/rpc"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

type Props = {
  surveyId: number
  introPart1?: React.ReactNode
  introPart2?: React.ReactNode
  introPart3?: React.ReactNode
}

export const SurveyMainPage = ({ surveyId, introPart1 }: Props) => {
  const [stage, setStage] = useState<Stage>(
    process.env.NEXT_PUBLIC_PUBLIC_SURVEY_START_STAGE_NEW || "START",
  )
  const [isIntro, setIsIntro] = useState(true)
  const surveySlug = useParams()?.surveySlug as AllowedSurveySlugs
  const [isSpinner, setIsSpinner] = useState(false)
  const [surveySessionId, setSurveySessionId] = useState<null | number>(null)
  const [createSurveySessionMutation] = useMutation(createSurveySession)
  const [createSurveyResponseMutation] = useMutation(createSurveyResponse)
  // to reset form when repeated
  const [formKey, setFormKey] = useState(1)
  const meta = getConfigBySurveySlug(surveySlug, "meta")
  const { progessBarDefinition } = meta
  const [progress, setProgress] = useState(progessBarDefinition["part1"])

  const part3 = getConfigBySurveySlug(surveySlug, "part3")

  // todo maybe do this somewhere else
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--survey-primary-color", meta.primaryColor)
    root.style.setProperty("--survey-dark-color", meta.darkColor)
    root.style.setProperty("--survey-light-color", meta.lightColor)
  }, [meta.darkColor, meta.lightColor, meta.primaryColor])

  const getOrCreateSurveySessionId = async () => {
    if (surveySessionId) {
      return surveySessionId
    } else {
      const surveySession = await createSurveySessionMutation({ surveyId })
      setSurveySessionId(surveySession.id)
      return surveySession.id
    }
  }

  // @ts-expect-error todo
  const handleSurveyPart1Submit = async ({ value }) => {
    setIsSpinner(true)
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        // todo hard coded
        surveyPart: 1,
        data: JSON.stringify(value),
        source: "FORM",
        // todo hard coded default from backend config
        status: "PENDING",
      })
    })()
    console.log({ value })
    setTimeout(() => {
      setStage("PART2")
      // setProgress(stageProgressDefinition["MORE"])
      setIsSpinner(false)
      setIsIntro(true)
      scrollToTopWithDelay()
      setProgress(progessBarDefinition["part2"])
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
        // todo hard coded
        surveyPart: 2,
        data: JSON.stringify(value),
        source: "FORM",
        // todo hard coded default from backend config
        status: "PENDING",
      })
    })()

    const newProgressBar = (part3 && progessBarDefinition["part3"]) || progessBarDefinition["end"]
    const newStage = meta.again ? "PART2" : part3 ? "PART3" : "END"
    const newIntroState = !meta.again
    setFormKey(formKey + 1)

    console.log("submit2")
    console.log({ value })
    setTimeout(() => {
      setStage(newStage)
      setIsSpinner(false)
      setIsIntro(newIntroState)
      scrollToTopWithDelay()
      setProgress(newProgressBar)
    }, 900)
  }
  // @ts-expect-error todo
  const handleSurveyPart3Submit = async ({ value }) => {
    setIsSpinner(true)
    void (async () => {
      const surveySessionId_ = await getOrCreateSurveySessionId()
      await createSurveyResponseMutation({
        surveySessionId: surveySessionId_,
        // todo hard coded
        surveyPart: 3,
        data: JSON.stringify(value),
        source: "FORM",
        // todo hard coded default from backend config
        status: "PENDING",
      })
    })()
    console.log({ value })
    setTimeout(() => {
      setStage("END")
      setIsSpinner(false)
      setIsIntro(true)
      scrollToTopWithDelay()
      setProgress(progessBarDefinition["end"]!)
    }, 900)
  }

  const handleEndToPart2 = () => {
    setStage("PART2")
    setProgress(progessBarDefinition["part2"])
    setIsSpinner(false)
    scrollToTopWithDelay()
  }

  let component
  switch (stage) {
    case "PART1":
      component = (
        <SurveyPart
          isIntro={isIntro}
          setIsIntro={setIsIntro}
          setStage={setStage}
          surveyPartId="part1"
          handleSubmit={handleSurveyPart1Submit}
          intro={introPart1}
        />
      )
      break
    case "PART2":
      component = (
        <SurveyPart
          // reset form when repeated
          key={formKey + 1}
          isIntro={isIntro}
          setIsIntro={setIsIntro}
          setStage={setStage}
          surveyPartId="part2"
          handleSubmit={handleSurveyPart2Submit}
        />
      )
      break
    case "PART3":
      component = (
        <SurveyPart
          isIntro={isIntro}
          setIsIntro={setIsIntro}
          setStage={setStage}
          surveyPartId="part3"
          handleSubmit={handleSurveyPart3Submit}
        />
      )
      break
    case "END":
      component = <SurveyEnd onClickMore={handleEndToPart2} />
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
