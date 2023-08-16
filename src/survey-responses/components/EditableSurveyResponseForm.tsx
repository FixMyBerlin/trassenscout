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
import createSurveyResponseTopicsOnSurveyResponses from "src/survey-response-topics-on-survey-responses/mutations/createSurveyResponseTopicsOnSurveyResponses"
import deleteSurveyResponseTopicsOnSurveyResponses from "src/survey-response-topics-on-survey-responses/mutations/deleteSurveyResponseTopicsOnSurveyResponses"
import createSurveyResponseTopic from "src/survey-response-topics/mutations/createSurveyResponseTopic"
import getSurveyResponseTopicsByProject from "src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import { z } from "zod"
import updateSurveyResponse from "../mutations/updateSurveyResponse"
import { getSurveyResponseCategoryById } from "../utils/getSurveyResponseCategoryById"
import { EditableSurveyResponseListItemProps } from "./EditableSurveyResponseListItem"
import getSurveyResponseTopicsOnSurveyResponsesBySurveyResponse from "src/survey-response-topics-on-survey-responses/queries/getSurveyResponseTopicsOnSurveyResponsesBySurveyResponse"

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  schema?: S
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
  columnWidthClasses: EditableSurveyResponseListItemProps["columnWidthClasses"]
  response: SurveyResponse
}

export const FORM_ERROR = "FORM_ERROR"

export function EditableSurveyResponseForm<S extends z.ZodType<any, any>>({
  schema,
  response,
  initialValues,
  columnWidthClasses,
  className,
  ...props
}: FormProps<S>) {
  const methods = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  })

  const { projectSlug } = useSlugs()

  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const [{ surveyResponseTopicsOnSurveyResponses }, { refetch }] = useQuery(
    getSurveyResponseTopicsOnSurveyResponsesBySurveyResponse,
    {
      surveyResponseId: response.id,
    },
  )
  const [{ surveyResponseTopics }, { refetch: refetchTopics }] = useQuery(
    getSurveyResponseTopicsByProject,
    {
      projectSlug: projectSlug!,
    },
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

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    console.log("handleSubmit", { values })
    try {
      const updated = await updateSurveyResponseMutation({
        id: response.id,
        ...values,
        operatorId: values.operatorId === 0 ? null : Number(values.operatorId),
      })
      // TODO
      // await setQueryData(updated)
      await console.log(`successfully updated ${response.id}`)
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
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const handleNewTopic = async (values: HandleSubmit) => {
    const newTopicTitle = values.newTopic?.trim()
    if (!newTopicTitle) return
    try {
      const updated = await createSurveyResponseTopicMutation({
        title: newTopicTitle,
        projectSlug: projectSlug!,
      })
      // TODO
      // await setQueryData(updated)
      console.log(`successfully added new topic ${values.newTopic}`)
      await createSurveyResponseTopicsOnSurveyResponsesMutation({
        surveyResponseTopicId: updated.id,
        surveyResponseId: response.id,
      })
      await refetch()
      await refetchTopics()
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        className={className}
        onChange={async () => await methods.handleSubmit(handleSubmit)()}
        {...props}
      >
        <div className={clsx(columnWidthClasses.id, "flex-shrink-0")} />
        <LabeledRadiobuttonGroup
          classNameItemWrapper={clsx("flex-shrink-0", columnWidthClasses.status)}
          scope={"status"}
          items={[
            { value: "PENDING", label: "Ausstehend" },
            { value: "ASSIGNED", label: "Zugeordnet" },
            { value: "DONE_PLANING", label: "Erledigt (Planung)" },
            { value: "DONE_FAQ", label: "Erledigt (FAQ)" },
            { value: "IRRELEVANT", label: "Nicht erforderlich" },
          ]}
        />
        <div className={clsx(columnWidthClasses.operator, "flex-shrink-0")} />
        <div className="flex-grow space-y-8 pr-2">
          <div>
            <p className="font-bold mb-5">Kategorie</p>
            <div className="p-3 bg-gray-300 rounded">
              {/* @ts-ignore */}
              {getSurveyResponseCategoryById(JSON.parse(initialValues.data)["21"])}
            </div>
          </div>
          <div>
            <p className="font-bold mb-3">Baulastträger</p>
            <LabeledRadiobuttonGroup
              scope="operatorId"
              items={operators.map((operator: Operator) => {
                return { value: String(operator.id), label: operator.title }
              })}
            />
          </div>
          <div>
            <p className="font-bold mb-3">Themenzuordnung (für FAQ)</p>
            <LabeledCheckboxGroup
              key={surveyResponseTopics.map((t) => t.id).join("-")}
              scope="surveyResponseTopics"
              items={surveyResponseTopics.map((t) => {
                return {
                  value: String(t.id),
                  label: t.title,
                }
              })}
            />
          </div>
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
        <div className={clsx(columnWidthClasses.id, "flex-shrink-0")} />
        <div className={clsx(columnWidthClasses.status, "flex-shrink-0")} />
        <div className={clsx(columnWidthClasses.operator, "flex-shrink-0")} />
        <div className="flex-grow space-y-2 pr-2 pb-8">
          <LabeledTextField
            placeholder="Neuen Themenschwerpunkt eingeben"
            name="newTopic"
            label=""
          />
          <button
            type="submit"
            // disabled={ctx.formState.isSubmitting}
            className={blueButtonStyles}
          >
            Speichern & hinzufügen
          </button>
        </div>
      </form>
      <form
        className="flex"
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          await methods.handleSubmit(handleSubmit)()
        }}
      >
        <div className={clsx(columnWidthClasses.id, "flex-shrink-0")} />
        <div className={clsx(columnWidthClasses.status, "flex-shrink-0")} />
        <div className={clsx(columnWidthClasses.operator, "flex-shrink-0")} />
        <div className="flex-grow space-y-2 pr-2 pb-4">
          <p className="font-bold mb-3">Interne Notiz</p>
          <LabeledTextareaField
            help="Schreibe und update den internen Kommentar. Das Datum der letzen Änderung wird automatisch auf das heutige gesetzt. Der interne Kommenar wird überschrieben."
            name="note"
            label={""}
          />
          <button
            type="submit"
            // disabled={ctx.formState.isSubmitting}
            className={blueButtonStyles}
          >
            Notiz hinzufügen
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
