"use client"

import {
  LabeledCheckboxGroup,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { blueButtonStyles, Link } from "@/src/core/components/links"
import createProjectRecordTopic from "@/src/server/ProjectRecordTopics/mutations/createProjectRecordTopic"
import getProjectRecordTopicsByProject from "@/src/server/ProjectRecordTopics/queries/getProjectRecordTopicsByProject"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useState } from "react"

type ProjectRecordFormFieldsProps = {
  projectSlug: string
}

export const ProjectRecordFormFields = ({ projectSlug }: ProjectRecordFormFieldsProps) => {
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ projectRecordTopics }, { refetch }] = useQuery(getProjectRecordTopicsByProject, {
    projectSlug,
  })
  const [{ uploads }] = useQuery(getUploadsWithSubsections, {
    projectSlug,
  })
  const [newTopic, setNewTopic] = useState("")
  const [createProjectRecordTopicMutation] = useMutation(createProjectRecordTopic)

  const topicsOptions = projectRecordTopics.length
    ? projectRecordTopics.map((t) => {
        return { value: String(t.id), label: t.title }
      })
    : []

  const uploadsOptions = uploads.length
    ? uploads.map((u) => {
        return { value: String(u.id), label: u.title }
      })
    : []

  const subsectionOptions: [string | number, string][] = subsections.map((subsection) => [
    subsection.id,
    subsection.slug,
  ])
  subsectionOptions.unshift(["", "Keine Angabe"])

  const handleNewTopicFormSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!newTopic.trim()) return
    try {
      const createdOrFetched = await createProjectRecordTopicMutation({
        title: newTopic.trim(),
        projectSlug,
      })
      refetch()
    } catch (error: any) {
      console.error(error)
    }
    setNewTopic("")
  }

  return (
    <>
      <LabeledTextField type="date" name="date" label="am/bis" placeholder="" />

      <LabeledTextField name="title" label="Titel" />

      {subsectionOptions.length > 0 && (
        <LabeledSelect
          optional
          name="subsectionId"
          options={subsectionOptions}
          label="Planungsabschnitt"
        />
      )}
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
              "block w-full flex-grow appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            }
            label=""
          />
          <button
            type="button"
            onClick={handleNewTopicFormSubmit}
            className={clsx(blueButtonStyles, "!h-3 !px-3")}
          >
            Hinzufügen
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {!!uploadsOptions.length ? (
          <LabeledCheckboxGroup
            scope="uploads"
            classNameItemWrapper="grid grid-cols-2 gap-1.5 w-full"
            items={uploadsOptions}
            label="Dokumente"
          />
        ) : (
          <p>
            Es sind wurden keine Dokumente hochgeladen. Um Dokumente hochzuladen, verwenden Sie
            bitte die Upload-Funktion.
          </p>
        )}
        <div className="text-sm">
          <Link blank href={`/${projectSlug}/uploads/new`} icon="plus">
            Neues Dokument hochladen
          </Link>
          <p className="mt-1 text-gray-500">
            Lade ein Dokument im Projekt hoch und verknüpfe es danach mit diesem Protokoll
          </p>
        </div>
      </div>
    </>
  )
}
