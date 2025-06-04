import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { Modal } from "@/src/core/components/Modal"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { blueButtonStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import createSurveyResponse from "@/src/survey-responses/mutations/createSurveyResponse"
import { getSurveyCategoryOptions } from "@/src/survey-responses/utils/getSurveyCategoryOptions"
import createSurveySession from "@/src/survey-sessions/mutations/createSurveySession"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { PlusIcon } from "@heroicons/react/20/solid"
import { SurveyResponseSourceEnum } from "@prisma/client"
import { clsx } from "clsx"
import { useState } from "react"
import { ExternalSurveyResponseForm } from "./ExternalSurveyResponseForm"

type Props = { refetch: any }

export const ExternalSurveyResponseFormModal = ({ refetch }: Props) => {
  const projectSlug = useProjectSlug()
  const surveyId = useParam("surveyId", "string")
  const [survey] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })

  const [open, setOpen] = useState(false)
  const [createSurveySessionMutation] = useMutation(createSurveySession)
  const [createSurveyResponseMutation] = useMutation(createSurveyResponse)

  const feedbackDefinition = getConfigBySurveySlug(survey.slug, "part2")
  const backendDefinition = getConfigBySurveySlug(survey.slug, "backend")

  const locationId = getQuestionIdBySurveySlug(survey.slug, "location")
  const isLocationId = getQuestionIdBySurveySlug(survey.slug, "enableLocation")
  const feedbackText2 = getQuestionIdBySurveySlug(survey.slug, "feedbackText_2")

  const categories = getSurveyCategoryOptions(survey.slug)
  const mapProps = feedbackDefinition!.pages[1]?.fields.find(
    (q) => String(q.name) === String(locationId),
  )!.props

  const transformKeys = (obj: Record<string, any>) => {
    const newObj: Record<string, any> = {}

    for (const key in obj) {
      const newKey = key.includes("-") ? key.split("-")[1] : key
      newObj[newKey!] = obj[key]
    }

    return newObj
  }

  type HandleSubmit = any // todo any
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      values = transformKeys(values)
      if (values[isLocationId] === "false") delete values[locationId] // delete location data
      delete values[isLocationId] // delete map ja/nein response
      // in the future we will only have one data field for user text, but we have 2 data fields for user texts in the RS8 survey
      // the following lines are a workaround to have a consistent datastructure among all survey responses of the same survey
      if (feedbackText2) values[feedbackText2] = null

      const defaultStatus = backendDefinition.status[0].value

      const surveySession = await createSurveySessionMutation({ surveyId: Number(surveyId) })
      const surveyResponse = await createSurveyResponseMutation({
        surveyPart: 2,
        data: JSON.stringify(values),
        surveySessionId: surveySession.id,
        source: values.source as SurveyResponseSourceEnum,
        status: defaultStatus,
      })
      await refetch()
      setOpen(false)
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <IfUserCanEdit>
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
          categories={categories}
          mapProps={mapProps}
          handleSubmit={handleSubmit}
        />
      </Modal>
    </IfUserCanEdit>
  )
}
