import { useMutation } from "@blitzjs/rpc"
import { zodResolver } from "@hookform/resolvers/zod"
import { Operator } from "@prisma/client"
import clsx from "clsx"
import { PropsWithoutRef, useState } from "react"
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
import { useRouter } from "next/router"

type FormProps<S extends z.ZodType<any, any>> = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["form"]>,
  "onSubmit"
> & {
  schema?: S
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
  refetchResponsesAndTopics: () => void
  userLocationQuestionId: number | undefined
} & Pick<EditableSurveyResponseListItemProps, "response" | "operators" | "topics" | "subsections">

export const FORM_ERROR = "FORM_ERROR"

export function EditableSurveyResponseForm<S extends z.ZodType<any, any>>({
  schema,
  response,
  operators,
  topics,
  subsections,
  userLocationQuestionId,
  initialValues,
  refetchResponsesAndTopics,
}: FormProps<S>) {
  const router = useRouter()
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

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const operatorsOptions = operators.map((operator: Operator) => {
    return { value: String(operator.id), label: operator.title }
  })

  const handleSubmit = async (values: any) => {
    try {
      await updateSurveyResponseMutation({
        id: response.id,
        // We specify what we want to store explicity so that `data` and such is exclued
        status: values.status,
        note: values.note,
        // Note: initialValues need to initialize `operatorId: 0`
        operatorId: values.operatorId === (0 || "0") ? null : Number(values.operatorId),
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
      await refetchResponsesAndTopics()
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const handleNewTopic = async (values: any) => {
    const newTopicTitle = values.newTopic?.trim()
    if (!newTopicTitle) return

    console.log(router.query.topics)
    try {
      const createdOrFetched = await createSurveyResponseTopicMutation({
        title: newTopicTitle,
        projectSlug: projectSlug!,
      })
      await createSurveyResponseTopicsOnSurveyResponsesMutation({
        surveyResponseTopicId: createdOrFetched.id,
        surveyResponseId: response.id,
      })
      await refetchResponsesAndTopics()

      // For some super weird reason, the refetch does not return an updated response
      // New entries are added via the refetch of topics.
      // But the surveyResponse values still hold the old topic relation ids
      // As a workaround, we manually update the form state here…
      // @ts-expect-error
      methods.setValue("surveyResponseTopics", [
        ...values.surveyResponseTopics,
        String(createdOrFetched.id),
      ])
      // the EditableSurveyResponseFilterForm needs to update when a new topic is added here
      // this hapens with a useEffect in EditableSurveyResponseFilterForm
      await router.push(
        {
          query: {
            ...router.query,
            topics: [...(router.query.topics as string[]), String(createdOrFetched.id)],
          },
        },
        undefined,
        {
          scroll: false,
        },
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="flex flex-col justify-between col-span-2">
            <div className="flex flex-col w-full gap-10">
              <div className="grid grid-cols-2 w-full gap-8">
                <form onChange={async () => await methods.handleSubmit(handleSubmit)()}>
                  <h4 className="font-semibold mb-3">Status</h4>
                  <LabeledRadiobuttonGroup
                    classNameItemWrapper={clsx("flex-shrink-0")}
                    scope={"status"}
                    items={Object.entries(surveyResponseStatus).map(([value, label]) => {
                      return { value, label }
                    })}
                  />
                </form>

                <form onChange={async () => await methods.handleSubmit(handleSubmit)()}>
                  <h4 className="font-semibold mb-3">Baulastträger</h4>
                  <LabeledRadiobuttonGroup
                    scope="operatorId"
                    items={[...operatorsOptions, { value: "0", label: "Nicht zugeordnet" }]}
                  />
                </form>
              </div>
              <form
                className="flex"
                onChange={async () => await methods.handleSubmit(handleSubmit)()}
              >
                <div>
                  <h4 className="font-semibold mb-3">Themen (für FAQ)</h4>
                  <LabeledCheckboxGroup
                    classNameItemWrapper="grid grid-cols-3 grid-rows-10 grid-flow-col-dense"
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
            </div>
          </div>
        </div>

        <div>
          <EditableSurveyResponseFormMap
            responsePoint={
              // @ts-expect-error `data` is unkown
              response.data[userLocationQuestionId] as { lat: number; lng: number } | undefined
            }
            subsections={subsections}
          />
        </div>

        <form
          className="flex"
          onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            await methods.handleSubmit(handleNewTopic)()
            // @ts-expect-error
            methods.resetField("newTopic")
          }}
        >
          <div className="space-y-2 pr-2 pb-8 min-w-[300px]">
            <LabeledTextField placeholder="Thema hinzufügen" name="newTopic" label="" />
            <button type="submit" className={clsx(blueButtonStyles, "!py-2.5 !px-3")}>
              Hinzufügen
            </button>
          </div>
        </form>
      </div>
      <form
        className="flex mt-6"
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          await methods.handleSubmit(handleSubmit)()
          setHasUnsavedChanges(false)
        }}
      >
        <div className="flex-grow space-y-2 pr-2 pb-4">
          <p className="font-semibold mb-3">Interne Notiz</p>
          <LabeledTextareaField
            help="Bitte starten Sie Ihre Notiz immer mit ihrem Namen oder Kürzel"
            name="note"
            label=""
            onChange={() => setHasUnsavedChanges(true)}
            className={clsx(
              hasUnsavedChanges &&
                "focus:border-yellow-500 focus:ring-yellow-500 border-yellow-500 ring-yellow-500",
            )}
          />
          <div className="flex justify-between items-end">
            <button type="submit" className={clsx(blueButtonStyles, "!py-2.5 !px-3")}>
              Notiz speichern
            </button>
            <small className={clsx(!hasUnsavedChanges && "opacity-0", "text-yellow-500")}>
              ungespeicherte Änderungen
            </small>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
