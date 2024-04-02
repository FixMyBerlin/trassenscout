import { useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { PlusIcon } from "@heroicons/react/20/solid"
import { SurveyResponseSourceEnum } from "@prisma/client"
import clsx from "clsx"
import { useState } from "react"
import { blueButtonStyles } from "src/core/components/links"
import { Modal } from "src/core/components/Modal"
import {
  TMapProps,
  TResponse,
  TSingleOrMultiResponseProps,
} from "src/survey-public/components/types"
import { PinContext } from "src/survey-public/context/contexts"
import {
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
} from "src/survey-public/utils/getConfigBySurveySlug"
import createSurveyResponse from "src/survey-responses/mutations/createSurveyResponse"
import { ExternalSurveyResponseFormSchema } from "src/survey-responses/schema"
import createSurveySession from "src/survey-sessions/mutations/createSurveySession"
import getSurvey from "src/surveys/queries/getSurvey"
import { ExternalSurveyResponseForm, FORM_ERROR } from "./ExternalSurveyResponseForm"

type Props = { refetch: any }

export const ExternalSurveyResponseFormModal: React.FC<Props> = ({ refetch }) => {
  const surveyId = useParam("surveyId", "string")
  const [survey] = useQuery(getSurvey, { id: Number(surveyId) })

  const [open, setOpen] = useState(false)
  const [isLocation, setIsLocation] = useState(true)
  const [pinPosition, setPinPosition] = useState<null | { lng: number; lat: number }>(null)

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
  const userText1Id = evaluationRefs["feedback-usertext-1"]

  const categorieQuestion = feedbackQuestions.find((q) => q.id === categoryId)!
    .props as TSingleOrMultiResponseProps
  const categories: TResponse[] = categorieQuestion!.responses
  const mapProps = feedbackDefinition!.pages[0]!.questions.find(
    (q) => q.id === evaluationRefs["feedback-location"],
  )!.props as TMapProps

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      // in the future we will only have one data field for user text, but we have 2 data fields for user texts in the RS8 survey
      // the following lines are a workaround to have a consistent datastructure among all survey responses of the same survey
      const additionalUserTextId = evaluationRefs["feedback-usertext-2"]
      const additionalUserTextObject = additionalUserTextId
        ? { [additionalUserTextId]: null }
        : null

      const data = {
        [userText1Id!]: values.userText1 || null,
        [categoryId!]: Number(values.categoryId),
        [locationId!]:
          pinPosition && isLocation ? { lng: pinPosition.lng, lat: pinPosition.lat } : null,
        ...additionalUserTextObject,
      }
      console.log(data)
      const surveySession = await createSurveySessionMutation({ surveyId: Number(surveyId) })
      const surveyResponse = await createSurveyResponseMutation({
        surveyPart: 2,
        data: JSON.stringify(data),
        surveySessionId: surveySession.id,
        source: values.source as SurveyResponseSourceEnum,
      })
      await refetch()
      setOpen(false)
      setPinPosition(null)
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }
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
          setPinPosition(null)
        }}
      >
        <PinContext.Provider value={{ pinPosition, setPinPosition }}>
          <ExternalSurveyResponseForm
            isLocation={isLocation}
            setIsLocation={setIsLocation}
            schema={ExternalSurveyResponseFormSchema}
            categories={categories}
            mapProps={mapProps}
            submitText="Speichern"
            onSubmit={handleSubmit}
            initialValues={{ source: "EMAIL", isLocation: "true" }}
          />
        </PinContext.Provider>
      </Modal>
    </>
  )
}
