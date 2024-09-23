import {
  LabeledCheckboxGroup,
  LabeledRadiobuttonGroup,
  LabeledTextField,
  LabeledTextareaField,
} from "@/src/core/components/forms"
import { Link, blueButtonStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import { useUserCan } from "@/src/memberships/hooks/useUserCan"
import {
  TBackendConfig,
  backendConfig as defaultBackendConfig,
} from "@/src/survey-public/utils/backend-config-defaults"
import createSurveyResponseTopicsOnSurveyResponses from "@/src/survey-response-topics-on-survey-responses/mutations/createSurveyResponseTopicsOnSurveyResponses"
import deleteSurveyResponseTopicsOnSurveyResponses from "@/src/survey-response-topics-on-survey-responses/mutations/deleteSurveyResponseTopicsOnSurveyResponses"
import createSurveyResponseTopic from "@/src/survey-response-topics/mutations/createSurveyResponseTopic"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { zodResolver } from "@hookform/resolvers/zod"
import { Operator } from "@prisma/client"
import { clsx } from "clsx"
import { PropsWithoutRef, useState } from "react"
import { FormProvider, UseFormProps, useForm } from "react-hook-form"
import { LngLatBoundsLike } from "react-map-gl/maplibre"
import { z } from "zod"
import updateSurveyResponse from "../../mutations/updateSurveyResponse"
import { EditableSurveyResponseFormMap } from "./EditableSurveyResponseFormMap"
import { EditableSurveyResponseListItemProps } from "./EditableSurveyResponseListItem"
import { useFilters } from "./useFilters.nuqs"

type FormProps<S extends z.ZodType<any, any>> = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["form"]>,
  "onSubmit"
> & {
  schema?: S
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
  refetchResponsesAndTopics: () => void
  userLocationQuestionId: number | undefined
  maptilerUrl: string
  defaultViewState: LngLatBoundsLike
  showMap?: boolean
  backendConfig: TBackendConfig
} & Pick<EditableSurveyResponseListItemProps, "response" | "operators" | "topics" | "subsections">

export const FORM_ERROR = "FORM_ERROR"

export function EditableSurveyResponseForm<S extends z.ZodType<any, any>>({
  schema,
  response,
  operators,
  topics,
  defaultViewState,
  subsections,
  maptilerUrl,
  userLocationQuestionId,
  initialValues,
  refetchResponsesAndTopics,
  showMap,
  backendConfig,
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

  const [filter, setFilter] = useFilters()

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
      <div className={clsx(showMap ? "grid-cols-2" : "grid-cols-1", "grid gap-8")}>
        <div>
          <div className="col-span-2 flex flex-col justify-between">
            <div className="flex w-full flex-col gap-10">
              <div className="grid w-full grid-cols-2 gap-8">
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
              </div>
              <form onChange={async () => await methods.handleSubmit(handleSubmit)()}>
                <h4 className="mb-3 font-semibold">
                  {labels.topics?.pl || defaultBackendConfig.labels.topics.pl}
                </h4>
                <LabeledCheckboxGroup
                  classNameItemWrapper="grid grid-cols-3 grid-rows-10 grid-flow-col-dense"
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
            </div>
          </div>
        </div>

        {showMap && (
          <div>
            <EditableSurveyResponseFormMap
              surveySlug={survey.slug}
              marker={
                // @ts-expect-error `data` is unkown
                response.data[userLocationQuestionId] as { lat: number; lng: number } | undefined
              }
              maptilerUrl={maptilerUrl}
              defaultViewState={defaultViewState}
            />
            {
              // @ts-expect-error `data` is unkown
              response.data[userLocationQuestionId] && (
                <div className="pt-4">
                  <Link
                    href={Routes.SurveyResponseWithLocationPage({
                      projectSlug,
                      surveyId: surveyId!,
                      surveyResponseId: response.id,
                    })}
                  >
                    Alle verorteten Beiträge öffnen
                  </Link>
                </div>
              )
            }
          </div>
        )}

        <IfUserCanEdit>
          <form
            onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault()
              await methods.handleSubmit(handleNewTopic)()
              // @ts-expect-error
              methods.resetField("newTopic")
            }}
            className="min-w-[300px] space-y-2 pb-8 pr-2"
          >
            <LabeledTextField
              placeholder={`${
                labels.topics?.sg || defaultBackendConfig.labels.operator.sg
              } hinzufügen`}
              name="newTopic"
              label=""
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
      <form
        className="mt-6 flex"
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          await methods.handleSubmit(handleSubmit)()
          setHasUnsavedChanges(false)
        }}
      >
        <fieldset className="flex-grow space-y-2 pb-4 pr-2">
          <p className="mb-3 font-semibold">
            {labels.note?.sg || defaultBackendConfig.labels.note.sg}
          </p>
          <LabeledTextareaField
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
