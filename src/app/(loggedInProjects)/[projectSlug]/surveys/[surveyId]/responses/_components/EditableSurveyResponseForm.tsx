import { EditableSurveyResponseListItemProps } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/EditableSurveyResponseListItem"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import {
  TBackendConfig,
  backendConfig as defaultBackendConfig,
} from "@/src/app/beteiligung/_shared/backend-types"
import { blueButtonStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useUserCan } from "@/src/pagesComponents/memberships/hooks/useUserCan"
import createSurveyResponseTopic from "@/src/server/survey-response-topics/mutations/createSurveyResponseTopic"
import getSurveyResponseTopicsByProject from "@/src/server/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import updateSurveyResponse from "@/src/server/survey-responses/mutations/updateSurveyResponse"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { Operator } from "@prisma/client"
import { clsx } from "clsx"
import { PropsWithoutRef, useState } from "react"
import { LabeledInputRadioCheckbox } from "./form/LabeledInputRadioCheckbox"
import { FormElementWrapper } from "./form/LabeledInputRadioCheckboxWrapper"
import { LabeledTextarea } from "./form/LabeledTextarea"
import { useFilters } from "./useFilters.nuqs"

type Props = Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> & {
  backendConfig: TBackendConfig
  showMap?: boolean
} & Pick<EditableSurveyResponseListItemProps, "response" | "operators" | "topics">

export function EditableSurveyResponseForm({
  response,
  operators,
  topics,
  backendConfig,
  showMap,
}: Props) {
  const userCanEdit = useUserCan().edit
  const projectSlug = useProjectSlug()

  const { filter, setFilter } = useFilters()

  const [createSurveyResponseTopicMutation] = useMutation(createSurveyResponseTopic)
  const [updateSurveyResponseMutation] = useMutation(updateSurveyResponse)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  // local states for controlled forms
  const [responseOperator, setResponseOperator] = useState(
    response.operator || { title: "Nicht zugeordnet", slug: "0", id: 0 },
  )
  const [responseStatus, setResponseStatus] = useState(response.status)
  const [responseNote, setResponseNote] = useState(response.note)
  const [responseTopics, setResponseTopics] = useState(response.surveyResponseTopics.map(String))
  const [newTopic, setNewTopic] = useState("")

  const labels = backendConfig.labels || defaultBackendConfig.labels

  const statusOptions = backendConfig.status
  const operatorsOptions = operators.map((operator: Operator) => {
    return { value: String(operator.id), label: operator.title }
  })
  const topicsOptions = topics.length
    ? topics.map((t) => {
        return { value: String(t.id), label: t.title }
      })
    : []

  const surveyResponseUpdateObject = {
    projectSlug,
    id: response.id,
    source: response.source,
    // We specify what we want to store explicity so that `data` and such is exclued
    status: response.status,
    note: response.note,
    operatorId: response.operatorId,
  }

  const handleStatusOperatorTopicsInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, checked } = event.target

    switch (name) {
      case "responseOperator":
        setResponseOperator(
          // @ts-expect-error todo
          value === "0"
            ? { title: "Nicht zugeordnet", slug: "0", id: 0 }
            : operators.find((operator) => operator.id === Number(value)),
        )
        try {
          await updateSurveyResponseMutation({
            ...surveyResponseUpdateObject,
            operatorId: value === (0 || "0") ? null : Number(value),
          })
        } catch (error: any) {
          console.error(error)
        }
        break

      case "responseStatus":
        setResponseStatus(value)
        try {
          await updateSurveyResponseMutation({
            ...surveyResponseUpdateObject,
            status: value,
          })
        } catch (error: any) {
          console.error(error)
        }
        break

      case "note":
        setResponseNote(value)
        try {
          await updateSurveyResponseMutation({
            ...surveyResponseUpdateObject,
            note: value,
          })
        } catch (error: any) {
          console.error(error)
        }
        break
      case "surveyResponseTopics":
        const updatedTopics = checked
          ? [...responseTopics, value]
          : responseTopics.filter((item: string) => item !== value)
        setResponseTopics(updatedTopics)
        try {
          await updateSurveyResponseMutation({
            ...surveyResponseUpdateObject,
            surveyResponseTopics: updatedTopics.map((item) => Number(item)),
          })
          console.log("update Object updateSurveyResponseMutation", {
            ...surveyResponseUpdateObject,
            surveyResponseTopics: updatedTopics.map((item) => Number(item)),
          })
        } catch (error: any) {
          console.error(error)
        }
        break

      default:
        break
    }

    // todo check invalidateQuery
    invalidateQuery(getFeedbackSurveyResponsesWithSurveyDataAndComments)
  }

  const handleNoteFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await updateSurveyResponseMutation({
        ...surveyResponseUpdateObject,
        note: responseNote,
      })
    } catch (error: any) {
      console.error(error)
    }
    // todo check invalidateQuery
    invalidateQuery(getFeedbackSurveyResponsesWithSurveyDataAndComments)
    setHasUnsavedChanges(false)
  }

  const handleNewTopicFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const createdOrFetched = await createSurveyResponseTopicMutation({
        title: newTopic.trim(),
        projectSlug,
      })
      await updateSurveyResponseMutation({
        ...surveyResponseUpdateObject,
        surveyResponseTopics: [...responseTopics.map((t) => Number(t)), createdOrFetched.id],
      })
      // todo check invalidateQuery
      invalidateQuery(getSurveyResponseTopicsByProject)
      setResponseTopics([...responseTopics, String(createdOrFetched.id)])
      if (filter) setFilter({ ...filter, topics: [...filter.topics, String(createdOrFetched.id)] })
    } catch (error: any) {
      console.error(error)
    }
    setNewTopic("")
  }

  // todo fieldset
  return (
    <>
      <div className="flex flex-col gap-6">
        <div className={clsx("flex gap-6", showMap ? "flex-row" : "flex-col")}>
          <form className="flex flex-col gap-6">
            {/* BLT */}
            <FormElementWrapper
              label={labels.operator?.sg || defaultBackendConfig.labels.operator.sg}
            >
              {[...operatorsOptions, { value: "0", label: "Nicht zugeordnet" }].map((item) => (
                <LabeledInputRadioCheckbox
                  type="radio"
                  name="responseOperator"
                  key={item.value}
                  checked={String(responseOperator?.id) === item.value}
                  onChange={handleStatusOperatorTopicsInputChange}
                  value={item.value}
                  label={item.label}
                  disabled={!userCanEdit}
                />
              ))}
            </FormElementWrapper>
            {/* STATUS */}
            <FormElementWrapper
              label={labels.status?.sg || defaultBackendConfig.labels.category.sg}
            >
              {statusOptions.map((item) => (
                <LabeledInputRadioCheckbox
                  classNameLabelSpan={"px-2 py-1 rounded-full"}
                  labelSpanStyle={{ backgroundColor: item.color }}
                  type="radio"
                  name="responseStatus"
                  key={item.value}
                  checked={responseStatus === item.value}
                  onChange={handleStatusOperatorTopicsInputChange}
                  value={item.value}
                  label={item.label}
                  disabled={!userCanEdit}
                />
              ))}
            </FormElementWrapper>
          </form>
        </div>
        {/* TAGS */}
        <div className="flex flex-col items-start gap-4">
          <form className="">
            <FormElementWrapper label={labels.topics?.pl || defaultBackendConfig.labels.topics.pl}>
              <div
                // todo container query?
                className={clsx(
                  showMap && "md:grid-cols-3 lg:grid-cols-4",
                  "grid grid-cols-2 gap-1.5",
                )}
              >
                {topicsOptions.map((item) => (
                  <LabeledInputRadioCheckbox
                    type="checkbox"
                    name="surveyResponseTopics"
                    key={item.value}
                    checked={responseTopics.includes(item.value)}
                    onChange={handleStatusOperatorTopicsInputChange}
                    value={item.value}
                    label={item.label}
                    disabled={!userCanEdit}
                  />
                ))}
              </div>
            </FormElementWrapper>
          </form>
          <IfUserCanEdit>
            <form onSubmit={handleNewTopicFormSubmit} className="min-w-[300px] space-y-2">
              <input
                onChange={(e) => setNewTopic(e.target.value)}
                type="text"
                value={newTopic}
                maxLength={35}
                name="newTopic"
                placeholder={`${
                  labels.topics?.sg || defaultBackendConfig.labels.topics.sg
                } hinzufügen`}
                className={
                  "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                }
                disabled={!userCanEdit}
              />
              <button
                type="submit"
                disabled={!userCanEdit}
                className={clsx(blueButtonStyles, "px-3! py-2.5!")}
              >
                Hinzufügen
              </button>
            </form>
          </IfUserCanEdit>
        </div>
      </div>
      {/* NOTE */}
      <form className="flex" onSubmit={handleNoteFormSubmit}>
        <fieldset className="max-w-3xl">
          <FormElementWrapper label={labels.note?.sg || defaultBackendConfig.labels.note.sg}>
            <LabeledTextarea
              name="note"
              value={responseNote || ""}
              onChange={(e) => {
                setHasUnsavedChanges(true)
                setResponseNote(e.target.value)
              }}
              className={clsx(
                hasUnsavedChanges &&
                  "border-yellow-500 ring-yellow-500 focus:border-yellow-500 focus:ring-yellow-500",
              )}
              disabled={!userCanEdit}
            />
          </FormElementWrapper>
          <div className="my-2 text-sm text-gray-500">
            {userCanEdit ? labels.note?.help || defaultBackendConfig.labels.note.help : undefined}
          </div>
          <IfUserCanEdit>
            <div className="flex items-end justify-between">
              <button
                type="submit"
                disabled={!userCanEdit}
                className={clsx(blueButtonStyles, "px-3! py-2.5!")}
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
    </>
  )
}
