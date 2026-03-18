"use client"

import { ProjectRecordEmailSource } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordEmailSource"
import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import type { FormApi } from "@/src/core/components/forms/types"
import {
  LabeledCheckboxGroup,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { blueButtonStyles } from "@/src/core/components/links"
import { frenchQuote, shortTitle } from "@/src/core/components/text"
import { NumberArraySchema } from "@/src/core/utils/schema-shared"
import createProjectRecordTopic from "@/src/server/ProjectRecordTopics/mutations/createProjectRecordTopic"
import getProjectRecordTopicsByProject from "@/src/server/ProjectRecordTopics/queries/getProjectRecordTopicsByProject"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useState } from "react"

type Props = {
  form: FormApi<Record<string, unknown>>
  splitView?: boolean
  projectSlug: string
  emailSource?: {
    from: string | null
    subject: string | null
    date: Date | null
    textBody: string | null
    uploads: { id: number; title: string }[]
  } | null
}

function ProjectRecordFormFieldsInner({
  form,
  subsectionId,
  uploadsValue,
  splitView,
  projectSlug,
  emailSource,
}: Props & {
  subsectionId: unknown
  uploadsValue: unknown
}) {
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ subsubsections }] = useQuery(getSubsubsections, { projectSlug })
  const [{ projectRecordTopics }, { refetch: refetchTopics }] = useQuery(
    getProjectRecordTopicsByProject,
    { projectSlug },
  )
  const [newTopic, setNewTopic] = useState("")
  const [createProjectRecordTopicMutation] = useMutation(createProjectRecordTopic)
  const uploadIds = NumberArraySchema.parse(uploadsValue)

  const [{ uploads: selectedUploads = [] } = { uploads: [] }] = useQuery(
    getUploadsWithSubsections,
    { projectSlug, where: { id: { in: uploadIds } } },
    { enabled: uploadIds.length > 0 },
  )

  const handleSubsectionChange = (newSubsectionId: string) => {
    const currentSubsubsectionId = form.state.values.subsubsectionId
    if (currentSubsubsectionId) {
      const selectedSubsubsection = subsubsections.find(
        (s) => s.id === Number(currentSubsubsectionId),
      )
      if (selectedSubsubsection && selectedSubsubsection.subsectionId !== Number(newSubsectionId)) {
        void form.setFieldValue("subsubsectionId" as never, null as never)
      }
    }
  }

  const topicsOptions = projectRecordTopics.length
    ? projectRecordTopics.map((t) => {
        return { value: String(t.id), label: t.title }
      })
    : []

  const subsectionOptions: [string | number, string][] = subsections.map((subsection) => [
    subsection.id,
    shortTitle(subsection.slug),
  ])
  subsectionOptions.unshift(["", "Keine Angabe"])

  const subsubsectionOptions: [string | number, string][] = subsubsections
    .filter((subsubsection) => (subsectionId ? subsubsection.subsectionId == subsectionId : true))
    .sort((a, b) => a.subsection.slug.localeCompare(b.subsection.slug))
    .map((subsubsection) => [
      subsubsection.id,
      shortTitle(`${subsubsection.slug} (${subsubsection.subsection.slug})`),
    ])
  subsubsectionOptions.unshift(["", "Keine Angabe"])

  const selectedSubsection = subsectionId
    ? subsections.find((s) => s.id === Number(subsectionId))
    : null

  const subsubsectionLabel = selectedSubsection
    ? `Einträge für ${frenchQuote(shortTitle(selectedSubsection.slug))}`
    : "Alle Einträge"

  const handleNewTopicFormSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!newTopic.trim()) return
    try {
      await createProjectRecordTopicMutation({
        title: newTopic.trim(),
        projectSlug,
      })
      refetchTopics()
    } catch (error: unknown) {
      console.error(error)
    }
    setNewTopic("")
  }

  const setUploads = (ids: number[]) => {
    void form.setFieldValue("uploads" as never, ids as never)
  }

  return (
    <>
      <div className={splitView ? "flex gap-6" : ""}>
        <div className={splitView ? "flex-1 space-y-6" : "space-y-6"}>
          <div className="flex gap-4">
            <div className="w-48">
              <LabeledTextField
                form={form}
                type="date"
                name="date"
                label="am/bis"
                placeholder=""
              />
            </div>
            <div className="flex-1">
              <LabeledTextField form={form} name="title" label="Titel" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <LabeledSelect
              form={form}
              optional
              name="subsectionId"
              options={subsectionOptions}
              label="Planungsabschnitt"
              onChange={handleSubsectionChange}
            />

            <LabeledSelect
              form={form}
              optional
              name="subsubsectionId"
              options={subsubsectionOptions}
              label={subsubsectionLabel}
            />
          </div>

          <LabeledTextareaField
            form={form}
            name="body"
            optional
            label="Notizen (Markdown)"
            rows={20}
          />
          <div className="flex flex-col gap-3">
            <LabeledCheckboxGroup
              form={form}
              scope="projectRecordTopics"
              classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
              items={topicsOptions}
              label="Tags"
              optional
            />
            <div className="flex w-full items-end gap-2">
              <div className="grow">
                <label className="sr-only" htmlFor="newTopic">
                  Neues Tag
                </label>
                <input
                  id="newTopic"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  maxLength={35}
                  placeholder="Neues Tag"
                  className="block w-full grow appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleNewTopicFormSubmit}
                className={clsx(blueButtonStyles, "h-3! px-3!")}
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>

        {emailSource && splitView && <ProjectRecordEmailSource email={emailSource} />}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Dokumente (optional)</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {selectedUploads.map((upload) => {
            return (
              <UploadPreviewClickable
                key={upload.id}
                uploadId={upload.id}
                projectSlug={projectSlug}
                size="grid"
                onDeleted={async () => {
                  const existingUploads = NumberArraySchema.parse(uploadsValue)
                  const newUploads = existingUploads.filter((id) => id !== upload.id)
                  setUploads(newUploads)
                }}
              />
            )
          })}
          <UploadDropzoneContainer className="col-span-2 h-40 border border-gray-300 p-2">
            <UploadDropzone
              fillContainer
              onUploadComplete={async (newUploadIds) => {
                const existingUploads = NumberArraySchema.parse(uploadsValue)
                const newUploads = [...new Set([...existingUploads, ...newUploadIds])]
                setUploads(newUploads)
              }}
            />
          </UploadDropzoneContainer>
        </div>
      </div>

      <SuperAdminLogData data={{ subsectionId, uploadsValue, uploadIds }} />
    </>
  )
}

export const ProjectRecordFormFields = (props: Props) => {
  const { form, ...rest } = props
  return (
    <form.Subscribe
      selector={(s) => ({
        subsectionId: s.values.subsectionId,
        uploadsValue: s.values.uploads,
      })}
    >
      {(v) => <ProjectRecordFormFieldsInner form={form} {...v} {...rest} />}
    </form.Subscribe>
  )
}
