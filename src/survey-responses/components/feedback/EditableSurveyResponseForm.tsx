import { useMutation, useQuery } from "@blitzjs/rpc"
import { zodResolver } from "@hookform/resolvers/zod"
import { Operator, SurveyResponse } from "@prisma/client"
import clsx from "clsx"
import { PropsWithoutRef, useEffect } from "react"
import { FormProvider, UseFormProps, useForm } from "react-hook-form"
import {
  LabeledCheckboxGroup,
  LabeledRadiobuttonGroup,
  LabeledTextField,
  LabeledTextareaField,
} from "src/core/components/forms"
import { blueButtonStyles } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import createSurveyResponseTopicsOnSurveyResponses from "src/survey-response-topics-on-survey-responses/mutations/createSurveyResponseTopicsOnSurveyResponses"
import deleteSurveyResponseTopicsOnSurveyResponses from "src/survey-response-topics-on-survey-responses/mutations/deleteSurveyResponseTopicsOnSurveyResponses"
import getSurveyResponseTopicsOnSurveyResponsesBySurveyResponse from "src/survey-response-topics-on-survey-responses/queries/getSurveyResponseTopicsOnSurveyResponsesBySurveyResponse"
import createSurveyResponseTopic from "src/survey-response-topics/mutations/createSurveyResponseTopic"
import getSurveyResponseTopicsByProject from "src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import { z } from "zod"
import updateSurveyResponse from "../../mutations/updateSurveyResponse"
import { EditableSurveyResponseFormMap } from "./EditableSurveyResponseFormMap"
import { surveyResponseStatus } from "./surveyResponseStatus"

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  schema?: S
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
  response: SurveyResponse
  operators: Awaited<ReturnType<typeof getOperatorsWithCount>>["operators"]
  subsections: SubsectionWithPosition[]
  refetchResponses: () => void
}

export const FORM_ERROR = "FORM_ERROR"

export function EditableSurveyResponseForm<S extends z.ZodType<any, any>>({
  schema,
  response,
  operators,
  initialValues,
  subsections,
  refetchResponses,
}: FormProps<S>) {
  const methods = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  })
  const [{ surveyResponseTopicsOnSurveyResponses }, { refetch: refetchResponse }] = useQuery(
    getSurveyResponseTopicsOnSurveyResponsesBySurveyResponse,
    { surveyResponseId: response.id },
  )

  const { projectSlug } = useSlugs()
  const [{ surveyResponseTopics }, { refetch: refetchTopics }] = useQuery(
    getSurveyResponseTopicsByProject,
    { projectSlug: projectSlug! },
  )

  useEffect(() => {
    const surveyResponseTopics = surveyResponseTopicsOnSurveyResponses.map((r) =>
      String(r.surveyResponseTopicId),
    )
    // @ts-expect-error
    methods.setValue("surveyResponseTopics", surveyResponseTopics)
  }, [methods, surveyResponseTopicsOnSurveyResponses])

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

  //  @ts-expect-error
  const responsePoint = JSON.parse(response.data)?.["23"]

  const handleSubmit = async (values: any) => {
    console.log("handleSubmit", { values })
    try {
      await updateSurveyResponseMutation({
        id: response.id,
        ...values,
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

    try {
      const createdOrFetched = await createSurveyResponseTopicMutation({
        title: newTopicTitle,
        projectSlug: projectSlug!,
      })
      await createSurveyResponseTopicsOnSurveyResponsesMutation({
        surveyResponseTopicId: createdOrFetched.id,
        surveyResponseId: response.id,
      })
      console.log(`successfully updated ${createdOrFetched.id} and relation`)

      await refetchResponse() // will update the UI so the checkboxes are checkd
      await refetchTopics()
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
          <EditableSurveyResponseFormMap responsePoint={responsePoint} subsections={subsections} />
        </div>

        <div className="flex flex-col">
          <form
            className="flex"
            onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault()
              await methods.handleSubmit(handleNewTopic)()
              // @ts-expect-error
              methods.resetField("newTopic")
            }}
          >
            <div>
              <h4 className="font-bold mb-3">Themenzuordnung (für FAQ)</h4>
              <LabeledCheckboxGroup
                scope="surveyResponseTopics"
                items={surveyResponseTopics.map((t) => {
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
