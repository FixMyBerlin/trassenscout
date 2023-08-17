import { useMutation } from "@blitzjs/rpc"
import { zodResolver } from "@hookform/resolvers/zod"
import { Operator } from "@prisma/client"
import clsx from "clsx"
import { PropsWithoutRef } from "react"
import { FormProvider, UseFormProps, useForm } from "react-hook-form"
import {
  LabeledCheckboxGroup,
  LabeledRadiobuttonGroup,
  LabeledTextField,
  LabeledTextareaField,
} from "src/core/components/forms"
import { blueButtonStyles } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"
import createSurveyResponseTopicsOnSurveyResponses from "src/survey-response-topics-on-survey-responses/mutations/createSurveyResponseTopicsOnSurveyResponses"
import deleteSurveyResponseTopicsOnSurveyResponses from "src/survey-response-topics-on-survey-responses/mutations/deleteSurveyResponseTopicsOnSurveyResponses"
import createSurveyResponseTopic from "src/survey-response-topics/mutations/createSurveyResponseTopic"
import { z } from "zod"
import updateSurveyResponse from "../../mutations/updateSurveyResponse"
import { EditableSurveyResponseFormMap } from "./EditableSurveyResponseFormMap"
import { EditableSurveyResponseListItemProps } from "./EditableSurveyResponseListItem"
import { surveyResponseStatus } from "./surveyResponseStatus"

type FormProps<S extends z.ZodType<any, any>> = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["form"]>,
  "onSubmit"
> & {
  schema?: S
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
  refetchResponses: () => void
} & Pick<EditableSurveyResponseListItemProps, "response" | "operators" | "topics" | "subsections">

export const FORM_ERROR = "FORM_ERROR"

export function EditableSurveyResponseForm<S extends z.ZodType<any, any>>({
  schema,
  response,
  operators,
  topics,
  subsections,
  initialValues,
  refetchResponses,
}: FormProps<S>) {
  const methods = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  })

  const { projectSlug } = useSlugs()

  const [updateSurveyResponseMutation] = useMutation(updateSurveyResponse)
  const [surveyResponseTopicsOnSurveyResponsesMutation] = useMutation(
    createSurveyResponseTopicsOnSurveyResponses,
  )
  const [deleteSurveyResponseTopicsOnSurveyResponsesMutation] = useMutation(
    deleteSurveyResponseTopicsOnSurveyResponses,
  )
  const [createSurveyResponseTopicMutation] = useMutation(createSurveyResponseTopic)
  const [createSurveyResponseTopicsOnSurveyResponsesMutation] = useMutation(
    createSurveyResponseTopicsOnSurveyResponses,
  )

  const handleSubmit = async (values: any) => {
    console.log("handleSubmit", { values })
    try {
      await updateSurveyResponseMutation({
        id: response.id,
        // We specify what we want to store explicity so that `data` and such is exclued
        status: values.status,
        note: values.note,
        // Note: initialValues need to initialize `operatorId: 0`
        operatorId: values.operatorId === 0 ? null : Number(values.operatorId),
      })

      if (Boolean(values.surveyResponseTopics)) {
        try {
          await deleteSurveyResponseTopicsOnSurveyResponsesMutation({
            surveyResponseId: response.id,
          })
          for (let v of values.surveyResponseTopics) {
            await surveyResponseTopicsOnSurveyResponsesMutation({
              surveyResponseId: response.id,
              surveyResponseTopicId: Number(v),
            })
          }
        } catch (error: any) {
          console.error(error)
          return { [FORM_ERROR]: error }
        }
      }
      await refetchResponses()
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const handleNewTopic = async (values: any) => {
    const newTopicTitle = values.newTopic?.trim()
    if (!newTopicTitle) return

    console.log("handleNewTopic", { values })
    try {
      const createdOrFetched = await createSurveyResponseTopicMutation({
        title: newTopicTitle,
        projectSlug: projectSlug!,
      })
      await createSurveyResponseTopicsOnSurveyResponsesMutation({
        surveyResponseTopicId: createdOrFetched.id,
        surveyResponseId: response.id,
      })
      await refetchResponses()
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-4 gap-12">
        <div className="flex flex-col justify-between col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <form onChange={async () => await methods.handleSubmit(handleSubmit)()}>
              <h4 className="font-bold mb-3">Status</h4>
              <LabeledRadiobuttonGroup
                classNameItemWrapper={clsx("flex-shrink-0")}
                scope={"status"}
                items={Object.entries(surveyResponseStatus).map(([value, label]) => {
                  return { value, label }
                })}
              />
            </form>

            <form onChange={async () => await methods.handleSubmit(handleSubmit)()}>
              <h4 className="font-bold mb-3">Baulastträger</h4>
              <LabeledRadiobuttonGroup
                scope="operatorId"
                items={operators.map((operator: Operator) => {
                  return { value: String(operator.id), label: operator.title }
                })}
              />
            </form>
          </div>

          <form
            className="flex mt-6"
            onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault()
              await methods.handleSubmit(handleSubmit)()
            }}
          >
            <div className="flex-grow space-y-2 pr-2 pb-4">
              <p className="font-bold mb-3">Notiz</p>
              <LabeledTextareaField
                help="Bitte starten Sie Ihre Notiz immer mit ihrem Namen"
                name="note"
                label=""
              />
              <button type="submit" className={clsx(blueButtonStyles, "!py-2.5 !px-3")}>
                Speichern
              </button>
            </div>
          </form>
        </div>

        <div>
          <EditableSurveyResponseFormMap
            // @ts-expect-error `data` is unkown
            responsePoint={response.data["23"] as { lat: number; lng: number } | undefined}
            subsections={subsections}
          />
        </div>

        <div className="flex flex-col">
          <form className="flex" onChange={async () => await methods.handleSubmit(handleSubmit)()}>
            <div>
              <h4 className="font-bold mb-3">Themenzuordnung (für FAQ)</h4>
              <LabeledCheckboxGroup
                scope="surveyResponseTopics"
                items={topics.map((t) => {
                  return {
                    value: String(t.id),
                    label: t.title,
                  }
                })}
              />
            </div>
          </form>

          <form
            className="flex"
            onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault()
              await methods.handleSubmit(handleNewTopic)()
              // @ts-expect-error
              methods.resetField("newTopic")
            }}
          >
            <div className="flex-grow space-y-2 mt-6 pr-2 pb-8">
              <LabeledTextField placeholder="Thema hinzufügen" name="newTopic" label="" />
              <button type="submit" className={clsx(blueButtonStyles, "!py-2.5 !px-3")}>
                Hinzufügen
              </button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  )
}
