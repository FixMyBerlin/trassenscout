"use client"

import { SurveyButtonGrid } from "@/src/app/beteiligung/_components/buttons/SurveyButtonGrid"
import { Debug } from "@/src/app/beteiligung/_components/Debug"
import { FormErrorBox } from "@/src/app/beteiligung/_components/form/FormErrorBox"
import { Intro } from "@/src/app/beteiligung/_components/Intro"
import { ProgressContext } from "@/src/app/beteiligung/_shared/contexts/contexts"
import { useAppForm } from "@/src/app/beteiligung/_shared/hooks/form"
import { Stage } from "@/src/app/beteiligung/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import {
  getConfigBySurveySlug,
  getprogressBarDefinitionBySurveySlug,
} from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { pageHasErrors } from "@/src/app/beteiligung/_shared/utils/pageHasErrors"
import { scrollToTopWithDelay } from "@/src/app/beteiligung/_shared/utils/scrollToTopWithDelay"
import { useParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { z } from "zod"

type Props = {
  stage: "part1" | "part2" | "part3"
  handleSubmit: ({
    value,
    meta,
  }: {
    value: FormData
    meta: { again: boolean; surveyResponseId: number }
  }) => Promise<void>
  setStage: (stage: Stage) => void
  isIntro: boolean
  setIsIntro: (intro: boolean) => void
  surveyResponseId: number | null
  onStartPart: () => Promise<void>
}

export const SurveyPart = ({
  stage,
  handleSubmit,
  setStage,
  setIsIntro,
  isIntro,
  surveyResponseId,
  onStartPart,
}: Props) => {
  const surveySlug = useParams()?.surveySlug as AllowedSurveySlugs
  const [page, setPage] = useState(0)
  const { setProgress } = useContext(ProgressContext)
  const surveyPart = getConfigBySurveySlug(surveySlug, stage)

  // fields of all pages of current stage
  const allPagesFields = surveyPart?.pages.map((page) => page.fields).flat()

  // filter out the non form fields here tbd
  const allPagesFormFields = allPagesFields?.filter(
    (field) => field.componentType === "form" && field.component !== "hidden",
  )

  const schema = z.object(
    Object.fromEntries(
      allPagesFormFields?.map((field) => [field.name, field.validation.zodSchema]) || [],
    ),
  )
  // .superRefine((data, ctx) => {
  //   allPagesFormFields
  //     ?.filter((field) => field.zodSuperRefine)
  //     ?.map((field) => field.zodSuperRefine!(data, ctx))
  // })

  const form = useAppForm({
    defaultValues: allPagesFormFields
      ? Object.fromEntries(allPagesFormFields.map((field) => [field.name, field.defaultValue]))
      : undefined,
    onSubmitMeta: {} as { again: boolean; surveyResponseId: number },
    onSubmit: handleSubmit,
    // @ts-expect-error tbd
    validators: { onSubmit: schema },
    // this does not work todo
    // listeners: {
    //   onSubmit: (value) => {
    //     console.log("listeners form", value)
    //     if (
    //       value.conditionCase1A === "nein"
    //       // &&
    //       // (!value.conditionalCase1A || value.conditionalCase1A.trim() === "")
    //     ) {
    //       console.log("default setzen")
    //     }
    //   },
    // },
  })

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (form.state.isDirty) return e.preventDefault()
    }
    window.addEventListener("beforeunload", beforeUnload)
    return () => {
      window.removeEventListener("beforeunload", beforeUnload)
    }
  }, [form.state.isDirty])

  if (!surveyPart) {
    return (
      <div>
        Dieser Teil der Umfrage wurde nicht defniert. Bitte passe die Konfigurierungsdatei an.
      </div>
    )
  }

  // filter out the form fields of current page
  const allCurrentPageFormFields =
    surveyPart.pages[page]?.fields.filter((field) => field.componentType === "form") || []

  const currentProgressBar = getprogressBarDefinitionBySurveySlug(surveySlug, stage)

  const handleStart = async () => {
    // Create pending CREATED response before starting the form
    await onStartPart()
    setIsIntro(false)
    setPage(0)
    scrollToTopWithDelay()
    setProgress(currentProgressBar)
  }

  const handleNextClick = () => {
    if (!pageHasErrors({ form, fields: allCurrentPageFormFields })) {
      const newPage = Math.min(surveyPart.pages.length - 1, page + 1)
      setPage(newPage)
      scrollToTopWithDelay()
      setProgress(currentProgressBar + newPage)
    }
  }

  const handleSubmitClick = () => {
    // we need to validate all fields of the current page programmatically
    // because if no field of (last) page is touched the form is somehow "not submittable" but errors are also not shown - this workaround works ok for now
    // tbd
    // form.validateField() does not work as expected - it validates ALL fields
    allCurrentPageFormFields
      .map((f) => f.name)
      ?.forEach((name) => {
        form.validateField(name, "submit")
      })
  }

  const handleBackClick = () => {
    if (page === 0) {
      setIsIntro(true)
    } else {
      const newPage = Math.max(0, page - 1)
      setPage(newPage)
      scrollToTopWithDelay()
      setProgress(currentProgressBar + newPage)
    }
  }

  return (
    <>
      <Debug className="border-red-500">
        <code>
          <pre>State im Surveypart: {isIntro ? "INTRO" : "UMFRAGE"}</pre>
          <pre>
            page: {page} - also {page + 1}.Seite der Umfrage
          </pre>
        </code>
      </Debug>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!surveyResponseId) {
            console.error("Cannot submit: surveyResponseId is null")
            return
          }
          const submitter = (e.nativeEvent as SubmitEvent).submitter
          const again = submitter?.id === "again"
          form.handleSubmit({ again, surveyResponseId })
        }}
      >
        {isIntro ? (
          <Intro
            // atm we have a hard coded custom component as intro for Survey Part 1 as we had too many custom requirements
            // todo maybe we can make this more generic in the future
            intro={surveyPart.intro}
            handleIntroClick={handleStart}
            setStage={setStage}
          />
        ) : (
          <>
            {surveyPart.pages[page]?.fields
              .filter((field) => field.component !== "hidden")
              .map((configField) => {
                // CONTNENT FIELDS
                if (configField.componentType === "content") {
                  return (
                    // @ts-expect-error tbd ?
                    <form.AppField name={configField.name} key={configField.name}>
                      {(field) => {
                        const Component = field[configField.component]
                        if (!Component) return null
                        // typescript does not know that the component is a valid field component
                        // @ts-expect-error tbd
                        return <Component {...configField.props} />
                      }}
                    </form.AppField>
                  )
                } else {
                  // FORM FIELDS
                  // if config field has a condition we wrap it in a subscribe
                  if (configField.condition) {
                    return (
                      <form.Subscribe
                        key={configField.name}
                        selector={(state) => {
                          return {
                            // @ts-expect-error tbd ?
                            dependendFieldValue: state.values[configField.condition!.fieldName],
                          }
                        }}
                      >
                        {({ dependendFieldValue }) => {
                          // check if condition is met
                          if (configField.condition!.conditionFn(dependendFieldValue))
                            return (
                              <form.AppField
                                validators={configField.validators}
                                listeners={configField.listeners}
                                name={configField.name}
                                key={configField.name}
                              >
                                {(field) => {
                                  const Component = field[configField.component]
                                  if (!Component) return null
                                  return (
                                    // typescript does not know that the component is a valid field component
                                    // @ts-expect-error tbd
                                    <Component
                                      required={configField.validation.required}
                                      {...configField.props}
                                    />
                                  )
                                }}
                              </form.AppField>
                            )
                        }}
                      </form.Subscribe>
                    )
                  } else {
                    return (
                      <form.AppField
                        validators={configField.validators}
                        listeners={configField.listeners}
                        name={configField.name}
                        key={configField.name}
                      >
                        {(field) => {
                          const Component = field[configField.component]
                          if (!Component) return null
                          return (
                            // typescript does not know that the component is a valid field component
                            // @ts-expect-error tbd
                            <Component
                              required={configField.validation.required}
                              {...configField.props}
                            />
                          )
                        }}
                      </form.AppField>
                    )
                  }
                }
              })}
            <form.Subscribe selector={(state) => state.fieldMeta}>
              {(fieldMeta) => (
                <FormErrorBox
                  // fieldNamesToValidate={surveyPart.pages[page]?.fields.map((field) => field.name)}
                  fieldMeta={fieldMeta}
                  allCurrentFieldsOfPage={allCurrentPageFormFields}
                />
              )}
            </form.Subscribe>
            <form.AppForm>
              <SurveyButtonGrid
                buttonLeft1={
                  <form.SubscribeButton color="white" type="button" onClick={handleBackClick}>
                    {surveyPart.buttonLabels.back}
                  </form.SubscribeButton>
                }
                buttonRight1={
                  !(page === surveyPart.pages.length - 1) ? (
                    <form.SubscribeButton id="next" type="button" onClick={handleNextClick}>
                      {surveyPart.buttonLabels.next}
                    </form.SubscribeButton>
                  ) : (
                    // this wrapper div seems to prevent the next button submitting the form if we go back and forth with all fields valid; maybe this can be improved
                    <div>
                      <form.SubscribeButton id="submit" type="submit" onClick={handleSubmitClick}>
                        {surveyPart.buttonLabels.submit}
                      </form.SubscribeButton>
                    </div>
                  )
                }
                buttonRight2={
                  stage === "part2" &&
                  page === surveyPart.pages.length - 1 &&
                  // @ts-expect-error
                  surveyPart.buttonLabels.again && (
                    <div>
                      <form.SubscribeButton id="again" type="submit">
                        {/* @ts-expect-error  */}
                        {surveyPart.buttonLabels.again}
                      </form.SubscribeButton>
                    </div>
                  )
                }
              />
            </form.AppForm>
          </>
        )}
      </form>
    </>
  )
}
