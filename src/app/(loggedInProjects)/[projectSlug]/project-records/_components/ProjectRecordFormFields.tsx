"use client"

import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import {
  LabeledCheckboxGroup,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { blueButtonStyles } from "@/src/core/components/links"
import { frenchQuote, shortTitle } from "@/src/core/components/text"
import { NumberArraySchema } from "@/src/core/utils/schema-shared"
import { ProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
import createProjectRecordTopic from "@/src/server/ProjectRecordTopics/mutations/createProjectRecordTopic"
import getProjectRecordTopicsByProject from "@/src/server/ProjectRecordTopics/queries/getProjectRecordTopicsByProject"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"

type ProjectRecordFormFieldsProps = {
  projectSlug: string
}

export const ProjectRecordFormFields = ({ projectSlug }: ProjectRecordFormFieldsProps) => {
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ subsubsections }] = useQuery(getSubsubsections, { projectSlug })
  const [{ projectRecordTopics }, { refetch: refetchTopics }] = useQuery(
    getProjectRecordTopicsByProject,
    { projectSlug },
  )
  const [newTopic, setNewTopic] = useState("")
  const [createProjectRecordTopicMutation] = useMutation(createProjectRecordTopic)
  const { watch, setValue } = useFormContext<z.infer<typeof ProjectRecordFormSchema>>()
  const subsectionId = watch("subsectionId")
  const uploadsValue = watch("uploads")
  const uploadIds = NumberArraySchema.parse(uploadsValue)

  const [{ uploads: selectedUploads = [] } = { uploads: [] }] = useQuery(
    getUploadsWithSubsections,
    { projectSlug, where: { id: { in: uploadIds } } },
    { enabled: uploadIds.length > 0 },
  )

  const handleSubsectionChange = (newSubsectionId: string) => {
    const currentSubsubsectionId = watch("subsubsectionId")
    if (currentSubsubsectionId) {
      const selectedSubsubsection = subsubsections.find(
        (s) => s.id === Number(currentSubsubsectionId),
      )
      if (selectedSubsubsection && selectedSubsubsection.subsectionId !== Number(newSubsectionId)) {
        setValue("subsubsectionId", null)
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
      const createdOrFetched = await createProjectRecordTopicMutation({
        title: newTopic.trim(),
        projectSlug,
      })
      refetchTopics()
    } catch (error: any) {
      console.error(error)
    }
    setNewTopic("")
  }

  return (
    <>
      <div className="flex gap-4">
        <div className="w-48">
          <LabeledTextField type="date" name="date" label="am/bis" placeholder="" />
        </div>
        <div className="flex-1">
          <LabeledTextField name="title" label="Titel" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LabeledSelect
          optional
          name="subsectionId"
          options={subsectionOptions}
          label="Planungsabschnitt"
          onChange={handleSubsectionChange}
        />

        <LabeledSelect
          optional
          name="subsubsectionId"
          options={subsubsectionOptions}
          label={subsubsectionLabel}
        />
      </div>

      <LabeledTextareaField name="body" optional label="Notizen (Markdown)" rows={10} />

      <div className="flex flex-col gap-3">
        <LabeledCheckboxGroup
          scope="projectRecordTopics"
          classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
          items={topicsOptions}
          label="Tags"
          optional
        />
        <div className="flex w-full items-end gap-2">
          <LabeledTextField
            onChange={(e) => setNewTopic(e.target.value)}
            value={newTopic}
            maxLength={35}
            name="newTopic"
            placeholder="Neues Tag"
            className={
              "block w-full grow appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
            }
            label=""
          />
          <button
            type="button"
            onClick={handleNewTopicFormSubmit}
            className={clsx(blueButtonStyles, "h-3! px-3!")}
          >
            Hinzufügen
          </button>
        </div>
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
                  const existingUploads = Array.isArray(uploadsValue) ? uploadsValue : []
                  const newUploads = existingUploads.filter((id: number) => id !== upload.id)
                  setValue("uploads", newUploads, { shouldDirty: true })
                }}
              />
            )
          })}
          <UploadDropzoneContainer className="h-40 border border-gray-300 p-2">
            <UploadDropzone
              fillContainer
              onUploadComplete={async (newUploadIds) => {
                // Add new upload IDs to the form
                const existingUploads = Array.isArray(uploadsValue) ? uploadsValue : []
                const newUploads = [...new Set([...existingUploads, ...newUploadIds])]
                setValue("uploads", newUploads, { shouldDirty: true })
              }}
            />
          </UploadDropzoneContainer>
        </div>
      </div>
    </>
  )
}
