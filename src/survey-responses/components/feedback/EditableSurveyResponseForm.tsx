import {
  LabeledCheckboxGroup,
  LabeledRadiobuttonGroup,
  LabeledTextField,
  LabeledTextareaField,
} from "@/src/core/components/forms"
import { blueButtonStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useUserCan } from "@/src/pagesComponents/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import {
  TBackendConfig,
  backendConfig as defaultBackendConfig,
} from "@/src/survey-public/utils/backend-config-defaults"
import createSurveyResponseTopicsOnSurveyResponses from "@/src/survey-response-topics-on-survey-responses/mutations/createSurveyResponseTopicsOnSurveyResponses"
import deleteSurveyResponseTopicsOnSurveyResponses from "@/src/survey-response-topics-on-survey-responses/mutations/deleteSurveyResponseTopicsOnSurveyResponses"
import createSurveyResponseTopic from "@/src/survey-response-topics/mutations/createSurveyResponseTopic"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { zodResolver } from "@hookform/resolvers/zod"
import { Operator } from "@prisma/client"
import { clsx } from "clsx"
import { PropsWithoutRef, useState } from "react"
import { FormProvider, UseFormProps, useForm } from "react-hook-form"
import { z } from "zod"
import updateSurveyResponse from "../../mutations/updateSurveyResponse"
import { EditableSurveyResponseListItemProps } from "./EditableSurveyResponseListItem"
import { useFilters } from "./useFilters.nuqs"

type FormProps<S extends z.ZodType<any, any>> = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["form"]>,
  "onSubmit"
> & {
  schema?: S
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
  refetchResponsesAndTopics: () => void
  backendConfig: TBackendConfig
  showMap?: boolean
} & Pick<EditableSurveyResponseListItemProps, "response" | "operators" | "topics" | "subsections">

export const FORM_ERROR = "FORM_ERROR"

export function EditableSurveyResponseForm<S extends z.ZodType<any, any>>({
  schema,
  response,
  operators,
  topics,
  initialValues,
  refetchResponsesAndTopics,
  backendConfig,
  showMap,
}: FormProps<S>) {
  const userCanEdit = useUserCan().edit
  const methods = useForm<z.infer<S>>({
    mode: "onBlur",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  })

  const projectSlug = useProjectSlug()
  const surveyId = useParam("surveyId", "string")
  const [survey] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })

  const { filter, setFilter } = useFilters()

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

  const labels = backendConfig.labels || defaultBackendConfig.labels
  const surveyResponseStatus = backendConfig.status

  const operatorsOptions = operators.map((operator: Operator) => {
    return { value: String(operator.id), label: operator.title }
  })

  const handleSubmit = async (values: any) => {
    try {
      await updateSurveyResponseMutation({
        projectSlug,
        id: response.id,
        source: response.source,
        // We specify what we want to store explicity so that `data` and such is exclued
        status: values.responseStatus,
        note: values.note,
        // Note: initialValues need to initialize `operatorId: 0`
        operatorId: values.operatorId === (0 || "0") ? null : Number(values.operatorId),
      })

      if (Boolean(values.surveyResponseTopics)) {
        try {
          await deleteSurveyResponseTopicsOnSurveyResponsesMutation({
            surveyResponseId: response.id,
          })
          for (const v of values.surveyResponseTopics) {
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

    try {
      const createdOrFetched = await createSurveyResponseTopicMutation({
        title: newTopicTitle,
        projectSlug,
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
      if (filter?.topics)
        await setFilter({ ...filter, topics: [...filter.topics, String(createdOrFetched.id)] })
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <FormProvider {...methods}>
      {/* STATUS BLT TAGS */}
      <div className="flex flex-col gap-6">
        <div className={clsx("flex gap-6", showMap ? "flex-row" : "flex-col")}>
          {/* BLT */}
          <form onChange={async () => await methods.handleSubmit(handleSubmit)()}>
            <h4 className="mb-3 font-semibold">
              {labels.operator?.sg || defaultBackendConfig.labels.operator.sg}
            </h4>
            <LabeledRadiobuttonGroup
              scope="operatorId"
              items={[...operatorsOptions, { value: "0", label: "Nicht zugeordnet" }]}
              disabled={!userCanEdit}
            />
          </form>
          {/* STATUS */}
          <form onChange={async () => await methods.handleSubmit(handleSubmit)()}>
            <h4 className="mb-3 font-semibold">
              {labels.status?.sg || defaultBackendConfig.labels.category.sg}
            </h4>
            <LabeledRadiobuttonGroup
              classNameItemWrapper="flex-shrink-0"
              // the scope has to be different from the other form (filter form)! Otherwise this messes with our filter form and url state.
              scope="responseStatus"
              items={surveyResponseStatus.map(({ value, label }) => {
                return { value, label }
              })}
              disabled={!userCanEdit}
            />
          </form>
        </div>
        {/* TAGS */}
        <div className="flex flex-col items-start gap-4">
          <form onChange={async () => await methods.handleSubmit(handleSubmit)()}>
            <h4 className="mb-3 font-semibold">
              {labels.topics?.pl || defaultBackendConfig.labels.topics.pl}
            </h4>
            <LabeledCheckboxGroup
              classNameItemWrapper="grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4"
              scope="surveyResponseTopics"
              items={topics.map((t) => {
                return {
                  value: String(t.id),
                  label: t.title,
                }
              })}
              disabled={!userCanEdit}
            />
          </form>
          <IfUserCanEdit>
            <form
              onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault()
                await methods.handleSubmit(handleNewTopic)()
                // @ts-expect-error
                methods.resetField("newTopic")
              }}
              className="min-w-[300px] space-y-2"
            >
              <LabeledTextField
                placeholder={`${
                  labels.topics?.sg || defaultBackendConfig.labels.topics.sg
                } hinzufügen`}
                name="newTopic"
                label=""
                maxLength={35}
                disabled={!userCanEdit}
              />
              <button
                type="submit"
                disabled={!userCanEdit}
                className={clsx(blueButtonStyles, "!px-3 !py-2.5")}
              >
                Hinzufügen
              </button>
            </form>
          </IfUserCanEdit>
        </div>
      </div>
      <form
        className="flex"
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          await methods.handleSubmit(handleSubmit)()
          setHasUnsavedChanges(false)
        }}
      >
        <fieldset className="w-full">
          <p className="mb-3 font-semibold">
            {labels.note?.sg || defaultBackendConfig.labels.note.sg}
          </p>
          <LabeledTextareaField
            outerProps={{ className: "max-w-3xl" }}
            help={
              userCanEdit ? labels.note?.help || defaultBackendConfig.labels.note.help : undefined
            }
            name="note"
            label=""
            onChange={() => setHasUnsavedChanges(true)}
            className={clsx(
              hasUnsavedChanges &&
                "border-yellow-500 ring-yellow-500 focus:border-yellow-500 focus:ring-yellow-500",
            )}
            disabled={!userCanEdit}
          />
          <IfUserCanEdit>
            <div className="flex items-end justify-between">
              <button
                type="submit"
                disabled={!userCanEdit}
                className={clsx(blueButtonStyles, "!px-3 !py-2.5")}
              >
                {labels.note?.sg || defaultBackendConfig.labels.note.sg} speichern
              </button>
              <small className={clsx(!hasUnsavedChanges && "opacity-0", "text-yellow-500")}>
                ungespeicherte Änderungen
              </small>
            </div>
          </IfUserCanEdit>
        </fieldset>
      </form>
    </FormProvider>
  )
}
