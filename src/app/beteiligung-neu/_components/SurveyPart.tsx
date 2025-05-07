"use client"

import { SurveyButtonGrid } from "@/src/app/beteiligung-neu/_components/buttons/SurveyButtonGrid"
import { FormErrorBox } from "@/src/app/beteiligung-neu/_components/form/FormErrorBox"
import { Intro } from "@/src/app/beteiligung-neu/_components/Intro"
import { ProgressContext } from "@/src/app/beteiligung-neu/_shared/contexts/contexts"
import { useAppForm } from "@/src/app/beteiligung-neu/_shared/hooks/form"
import { Stage } from "@/src/app/beteiligung-neu/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import {
  getConfigBySurveySlug,
  getprogressBarDefinitionBySurveySlug,
} from "@/src/app/beteiligung-neu/_shared/utils/getConfigBySurveySlug"
import { pageHasErrors } from "@/src/app/beteiligung-neu/_shared/utils/pageHasErrors"
import { scrollToTopWithDelay } from "@/src/app/beteiligung-neu/_shared/utils/scrollToTopWithDelay"
import { Debug } from "@/src/survey-public/components/core/Debug"

import { useParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { z } from "zod"

type Props = {
  stage: "part1" | "part2" | "part3"
  handleSubmit: ({ value, meta }: { value: FormData; meta: { again: boolean } }) => Promise<void>
  intro?: React.ReactNode
  setStage: (stage: Stage) => void
  isIntro: boolean
  setIsIntro: (intro: boolean) => void
}

export const SurveyPart = ({
  stage,
  handleSubmit,
  intro,
  setStage,
  setIsIntro,
  isIntro,
}: Props) => {
  const surveySlug = useParams()?.surveySlug as AllowedSurveySlugs
  const [page, setPage] = useState(0)
  const { setProgress } = useContext(ProgressContext)
  const surveyPart = getConfigBySurveySlug(surveySlug, stage)

  // fields of all pages of current stage
  const allPagesFields = surveyPart?.pages.map((page) => page.fields).flat()

  // filter out the non form fields here tbd
  const allPagesFormFields = allPagesFields?.filter((field) => field.componentType === "form")

  const schema = z
    .object(
      Object.fromEntries(allPagesFormFields?.map((field) => [field.name, field.zodSchema]) || []),
    )
    .superRefine((data, ctx) => {
      allPagesFormFields
        ?.filter((field) => field.zodSuperRefine)
        ?.map((field) => field.zodSuperRefine!(data, ctx))
    })

  const form = useAppForm({
    defaultValues: allPagesFormFields
      ? Object.fromEntries(allPagesFormFields.map((field) => [field.name, field.defaultValue]))
      : undefined,
    onSubmitMeta: {} as { again: boolean },
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

  const handleStart = () => {
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
          // @ts-expect-error
          form.handleSubmit({ again: e.nativeEvent.submitter.id === "again" })
        }}
      >
        {isIntro ? (
          <Intro
            // atm we have a hard coded custom component as intr for Survey Part 1 as we had too many custom requirements
            // todo maybe we can make this more generic in the future
            // todo disabled?
            intro={surveyPart.intro}
            customContent={intro}
            handleIntroClick={handleStart}
            setStage={setStage}
            disabled={false}
          />
        ) : (
          <>
            {surveyPart.pages[page]?.fields.map((configField) => {
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
                                // typescript does not know that the component is a valid field component
                                // @ts-expect-error tbd
                                return <Component {...configField.props} />
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
                        // typescript does not know that the component is a valid field component
                        // @ts-expect-error tbd
                        return <Component {...configField.props} />
                      }}
                    </form.AppField>
                  )
                }
              }
            })}
            {/* todo error box styling*/}
            {/* todo error box: filter page errors, show correct translated error messages */}
            <form.Subscribe selector={(state) => (state.errors, state.fieldMeta)}>
              {(fieldMeta) => (
                <FormErrorBox
                  // fieldNamesToValidate={surveyPart.pages[page]?.fields.map((field) => field.name)}
                  fieldMeta={fieldMeta}
                  fields={allCurrentPageFormFields}
                />
              )}
            </form.Subscribe>
            {/* todo  maybe single button componnts*/}
            {/* todo  do we want to disable? then we need to do this inside the component with form.state.errors... */}
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
                      <form.SubscribeButton id="submit" type="submit">
                        {surveyPart.buttonLabels.submit}
                      </form.SubscribeButton>
                    </div>
                  )
                }
                buttonRight2={
                  stage === "part2" &&
                  page === surveyPart.pages.length - 1 && (
                    <div>
                      <form.SubscribeButton id="again" type="submit">
                        {/* @ts-expect-error we know again exists in part2 */}
                        {surveyPart.buttonLabels.again ||
                          "Ich möchte diesen Umfrageteil erneut ausfüllen"}
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
