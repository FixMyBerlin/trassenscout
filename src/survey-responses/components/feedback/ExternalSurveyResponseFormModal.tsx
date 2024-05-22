import { useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { PlusIcon } from "@heroicons/react/20/solid"
import { SurveyResponseSourceEnum } from "@prisma/client"
import clsx from "clsx"
import { useState } from "react"
import { Modal } from "src/core/components/Modal"
import { blueButtonStyles } from "src/core/components/links"
import {
  TMapProps,
  TResponse,
  TSingleOrMultiResponseProps,
} from "src/survey-public/components/types"
import {
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
} from "src/survey-public/utils/getConfigBySurveySlug"
import createSurveyResponse from "src/survey-responses/mutations/createSurveyResponse"
import createSurveySession from "src/survey-sessions/mutations/createSurveySession"
import getSurvey from "src/surveys/queries/getSurvey"
import { z } from "zod"
import { ExternalSurveyResponseForm, FORM_ERROR } from "./ExternalSurveyResponseForm"

type Props = { refetch: any }

export const ExternalSurveyResponseFormModal: React.FC<Props> = ({ refetch }) => {
  const surveyId = useParam("surveyId", "string")
  const [survey] = useQuery(getSurvey, { id: Number(surveyId) })

  const [open, setOpen] = useState(false)
  const [createSurveySessionMutation] = useMutation(createSurveySession)
  const [createSurveyResponseMutation] = useMutation(createSurveyResponse)

  const { evaluationRefs } = getResponseConfigBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)

  const feedbackQuestions = []

  for (let page of feedbackDefinition.pages) {
    feedbackQuestions.push(...page.questions)
  }

  const categoryId = evaluationRefs["feedback-category"]
  const locationId = evaluationRefs["feedback-location"]
  const isLocationId = evaluationRefs["is-feedback-location"]
  const userText1Id = evaluationRefs["feedback-usertext-1"]

  const categorieQuestion = feedbackQuestions.find((q) => q.id === categoryId)!
    .props as TSingleOrMultiResponseProps
  const categories: TResponse[] = categorieQuestion!.responses
  const mapProps = feedbackDefinition!.pages[1]!.questions.find(
    (q) => q.id === evaluationRefs["feedback-location"],
  )!.props as TMapProps

  const transformKeys = (obj: Record<string, any>) => {
    const newObj: Record<string, any> = {}

    for (const key in obj) {
      const newKey = key.includes("-") ? key.split("-")[1] : key
      newObj[newKey!] = obj[key]
    }

    return newObj
  }

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      values = transformKeys(values)
      if (values[isLocationId] === "false") delete values[locationId] // delete location data
      delete values[isLocationId] // delete map ja/nein response
      // in the future we will only have one data field for user text, but we have 2 data fields for user texts in the RS8 survey
      // the following lines are a workaround to have a consistent datastructure among all survey responses of the same survey
      const additionalUserTextId = evaluationRefs["feedback-usertext-2"]
      if (additionalUserTextId) values[additionalUserTextId] = null

      const surveySession = await createSurveySessionMutation({ surveyId: Number(surveyId) })
      const surveyResponse = await createSurveyResponseMutation({
        surveyPart: 2,
        data: JSON.stringify(values),
        surveySessionId: surveySession.id,
        source: values.source as SurveyResponseSourceEnum,
      })
      await refetch()
      setOpen(false)
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const ExternalSurveyResponseFormSchema = z.object({
    source: z.nativeEnum(SurveyResponseSourceEnum),
    [`single-${isLocationId}`]: z.string(),
    [`single-${categoryId}`]: z.string(),
    [`text-${userText1Id}`]: z.string().nonempty({ message: "Pflichtfeld." }),
    [`map-${locationId}`]: z.any(),
  })

  // show map: inital value of is location is set to true
  const initialValuesKey = `single-${evaluationRefs["is-feedback-location"]}`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={clsx("flex flex-row gap-1", blueButtonStyles)}
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Beitrag manuell hinzufügen
      </button>
      <Modal
        className="sm:!max-w-[600px]"
        open={open}
        handleClose={() => {
          setOpen(false)
        }}
      >
        <ExternalSurveyResponseForm
          schema={ExternalSurveyResponseFormSchema}
          evaluationRefs={evaluationRefs}
          categories={categories}
          mapProps={mapProps}
          submitText="Speichern"
          onSubmit={handleSubmit}
          initialValues={{
            source: "EMAIL",
            [initialValuesKey]: "true",
            [`map-${locationId}`]: null,
          }}
        />
      </Modal>
    </>
  )
}
