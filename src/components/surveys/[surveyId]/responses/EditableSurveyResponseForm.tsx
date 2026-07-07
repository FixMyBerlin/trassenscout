import { useMutation } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { type JSX, PropsWithoutRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import { backendConfig as defaultBackendConfig } from "@/src/components/beteiligung/shared/backend-types"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { Link } from "@/src/components/core/components/links/Link"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { buildTagCheckboxItems } from "@/src/components/tags/buildTagCheckboxItems"
import { Operator } from "@/src/prisma/generated/browser"
import { patchSurveyResponseFn } from "@/src/server/survey-responses/surveyResponses.functions"
import { createSurveyResponseTagFn } from "@/src/server/surveyResponseTags/surveyResponseTags.functions"
import type { EditableSurveyResponseListItemProps } from "./EditableSurveyResponseListItem"
import { EditableSurveyResponseUploadsSection } from "./EditableSurveyResponseUploadsSection"
import { LabeledInputRadioCheckbox } from "./form/LabeledInputRadioCheckbox"
import { FormElementWrapper } from "./form/LabeledInputRadioCheckboxWrapper"
import { LabeledTextarea } from "./form/LabeledTextarea"
import { useSurveyResponseFilters as useFilters } from "./useSurveyResponseFilters"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> & {
  backendConfig: import("@/src/components/beteiligung/shared/backend-types").TBackendConfig
  showMap?: boolean
  refetchResponsesAndTopics: () => Promise<void>
} & Pick<EditableSurveyResponseListItemProps, "response" | "operators" | "topics">

export function EditableSurveyResponseForm({
  response,
  operators,
  topics,
  backendConfig,
  showMap,
  refetchResponsesAndTopics,
}: Props) {
  const userCanEdit = useUserCan().edit
  const { projectSlug } = loggedInProjectRouteApi.useParams()

  const { filter, setFilter } = useFilters()

  const createSurveyResponseTagMutation = useMutation({
    mutationFn: createSurveyResponseTagFn,
  })
  const patchSurveyResponseMutation = useMutation({ mutationFn: patchSurveyResponseFn })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  // local states for controlled forms
  const [responseOperator, setResponseOperator] = useState(
    response.operator || { title: "Nicht zugeordnet", slug: "0", id: 0 },
  )
  const [responseStatus, setResponseStatus] = useState(response.status)
  const [responseNote, setResponseNote] = useState(response.note)
  const [responseTopics, setResponseTopics] = useState(response.surveyResponseTags.map(String))
  const [newTopic, setNewTopic] = useState("")
  const surveySlug = response.surveySession.survey.slug as AllowedSurveySlugs

  const labels = backendConfig.labels || defaultBackendConfig.labels

  const statusOptions = backendConfig.status
  const operatorsOptions = operators.map((operator: Operator) => {
    return { value: String(operator.id), label: operator.title }
  })
  const topicsOptions = buildTagCheckboxItems(topics, responseTopics)

  // Base the patch payload on the local (already-edited) state, not on the `response`
  // prop. The prop only refreshes after refetchResponsesAndTopics() settles, so reading
  // from it would resend stale values and clobber a prior edit that has not been
  // refetched yet. Each handler still overrides its own field explicitly.
  // We specify what we want to store explicitly so that `data` and such is excluded.
  const surveyResponseUpdateObject = {
    projectSlug,
    id: response.id,
    source: response.source,
    status: responseStatus,
    note: responseNote,
    operatorId: responseOperator?.id ? responseOperator.id : null,
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
          await patchSurveyResponseMutation.mutateAsync({
            data: {
              ...surveyResponseUpdateObject,
              operatorId: value === "0" ? null : Number(value),
            },
          })
        } catch (error: any) {
          console.error(error)
        }
        break

      case "responseStatus":
        setResponseStatus(value)
        try {
          await patchSurveyResponseMutation.mutateAsync({
            data: {
              ...surveyResponseUpdateObject,
              status: value,
            },
          })
        } catch (error: any) {
          console.error(error)
        }
        break

      case "note":
        setResponseNote(value)
        try {
          await patchSurveyResponseMutation.mutateAsync({
            data: {
              ...surveyResponseUpdateObject,
              note: value,
            },
          })
        } catch (error: any) {
          console.error(error)
        }
        break
      case "surveyResponseTags":
        const updatedTopics = checked
          ? [...responseTopics, value]
          : responseTopics.filter((item: string) => item !== value)
        setResponseTopics(updatedTopics)
        try {
          await patchSurveyResponseMutation.mutateAsync({
            data: {
              ...surveyResponseUpdateObject,
              surveyResponseTags: updatedTopics.map((item) => Number(item)),
            },
          })
        } catch (error: any) {
          console.error(error)
        }
        break

      default:
        break
    }

    await refetchResponsesAndTopics()
  }

  const handleNoteFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await patchSurveyResponseMutation.mutateAsync({
        data: {
          ...surveyResponseUpdateObject,
          note: responseNote,
        },
      })
    } catch (error: any) {
      console.error(error)
    }
    await refetchResponsesAndTopics()
    setHasUnsavedChanges(false)
  }

  const handleNewTopicFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newTopic.trim()) return
    try {
      const createdOrFetched = await createSurveyResponseTagMutation.mutateAsync({
        data: {
          title: newTopic.trim(),
          projectSlug,
        },
      })
      await patchSurveyResponseMutation.mutateAsync({
        data: {
          ...surveyResponseUpdateObject,
          surveyResponseTags: [...responseTopics.map((t) => Number(t)), createdOrFetched.id],
        },
      })
      await refetchResponsesAndTopics()
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
        {/* UPLOADS */}
        <EditableSurveyResponseUploadsSection
          projectSlug={projectSlug}
          surveyId={response.surveySession.surveyId}
          responseId={response.id}
          responseData={response.data}
          surveySlug={surveySlug}
          refetchResponsesAndTopics={refetchResponsesAndTopics}
        />
        <div className={twJoin("flex gap-6", showMap ? "flex-row" : "flex-col")}>
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
          <div className="flex w-full items-end gap-5">
            <form className="grow">
              <FormElementWrapper
                label={labels.topics?.pl || defaultBackendConfig.labels.topics.pl}
              >
                <div
                  // todo container query?
                  className={twJoin(
                    showMap ? "md:grid-cols-3 lg:grid-cols-4" : "",
                    "grid grid-cols-2 gap-1.5",
                  )}
                >
                  {topicsOptions.map((item) => (
                    <LabeledInputRadioCheckbox
                      type="checkbox"
                      name="surveyResponseTags"
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
            <SuperAdminBox className="shrink-0">
              <Link
                to="/$projectSlug/survey-response-tags"
                params={{ projectSlug }}
                className="py-2"
                blank
              >
                Tags verwalten…
              </Link>
            </SuperAdminBox>
          </div>
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
                className={twJoin(primaryButtonClassName, "px-3! py-2.5!")}
              >
                Hinzufügen
              </button>
            </form>
          </IfUserCanEdit>
        </div>
      </div>
      {/* NOTE */}
      {!backendConfig.disableNote && (
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
                className={twJoin(
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
                  className={twJoin(primaryButtonClassName, "px-3! py-2.5!")}
                >
                  {labels.note?.sg || defaultBackendConfig.labels.note.sg} speichern
                </button>
                <small className={twJoin(!hasUnsavedChanges ? "opacity-0" : "", "text-yellow-500")}>
                  ungespeicherte Änderungen
                </small>
              </div>
            </IfUserCanEdit>
          </fieldset>
        </form>
      )}
    </>
  )
}
