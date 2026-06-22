"use client"

import { ProjectRecordEmailSource } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordEmailSource"
import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadTable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadTable"
import { getUserSelectOptions } from "@/src/app/_components/users/utils/getUserSelectOptions"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import {
  LabeledCheckboxGroup,
  LabeledCombobox,
  LabeledSelect,
  LabeledSwitch,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { blueButtonStyles } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text"
import { NumberArraySchema } from "@/src/core/utils/schema-shared"
import createProjectRecordTopic from "@/src/server/ProjectRecordTopics/mutations/createProjectRecordTopic"
import getProjectRecordTopicsByProject from "@/src/server/ProjectRecordTopics/queries/getProjectRecordTopicsByProject"
import getAcquisitionAreas from "@/src/server/acquisitionAreas/queries/getAcquisitionAreas"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ProjectRecordEditingState } from "@prisma/client"
import clsx from "clsx"
import { useState } from "react"
import { useFormContext } from "react-hook-form"

type Props = {
  formMode?: "create" | "edit"
  relationContext?: "project" | "subsubsection" | "acquisitionArea"
  splitView?: boolean
  projectSlug: string
  landAcquisitionModuleEnabled?: boolean
  disableSuspenseQueries?: boolean
  emailSource?: {
    from: string | null
    subject: string | null
    date: Date | null
    textBody: string | null
    uploads: { id: number; title: string }[]
  } | null
}

export const ProjectRecordFormFields = ({
  formMode = "edit",
  relationContext = "project",
  projectSlug,
  emailSource,
  splitView,
  landAcquisitionModuleEnabled = false,
  disableSuspenseQueries = false,
}: Props) => {
  const queryOptions = {
    suspense: !disableSuspenseQueries,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  }

  const [subsubsectionsData] = useQuery(getSubsubsections, { projectSlug }, queryOptions)
  const [acquisitionAreas = []] = useQuery(
    getAcquisitionAreas,
    { projectSlug },
    {
      enabled: landAcquisitionModuleEnabled,
      ...queryOptions,
    },
  )
  const [usersData] = useQuery(
    getProjectUsers,
    {
      projectSlug,
      role: splitView ? "EDITOR" : undefined,
    },
    queryOptions,
  )
  const [projectRecordTopicsData, { refetch: refetchTopics }] = useQuery(
    getProjectRecordTopicsByProject,
    { projectSlug },
    queryOptions,
  )
  const [newTopic, setNewTopic] = useState("")
  const [createProjectRecordTopicMutation] = useMutation(createProjectRecordTopic)
  const { watch, setValue } = useFormContext()
  const uploadsValue = watch("uploads")
  const uploadIds = NumberArraySchema.parse(uploadsValue)

  const subsubsections = subsubsectionsData?.subsubsections ?? []
  const users = usersData ?? []
  const projectRecordTopics = projectRecordTopicsData?.projectRecordTopics ?? []

  const [{ uploads: selectedUploads = [] } = { uploads: [] }] = useQuery(
    getUploadsWithSubsections,
    { projectSlug, where: { id: { in: uploadIds } } },
    {
      enabled: uploadIds.length > 0,
      ...queryOptions,
    },
  )

  const topicsOptions = projectRecordTopics.length
    ? projectRecordTopics.map((t) => {
        return { value: String(t.id), label: t.title }
      })
    : []

  const assignedToOptions = getUserSelectOptions(users)

  const subsubsectionItems = subsubsections
    .sort((a, b) => a.subsection.slug.localeCompare(b.subsection.slug))
    .map((subsubsection) => ({
      value: String(subsubsection.id),
      label: shortTitle(`${subsubsection.slug} (${subsubsection.subsection.slug})`),
    }))

  const acquisitionAreaItems = acquisitionAreas.map((acquisitionArea) => ({
    value: String(acquisitionArea.id),
    label: `${acquisitionArea.id} - Flurstücknr. ${acquisitionArea.parcel.alkisParcelId} (${shortTitle(
      acquisitionArea.subsubsection.slug,
    )})`,
  }))

  const showSubsubsectionField = !(formMode === "create" && relationContext === "acquisitionArea")
  const showAcquisitionAreaField =
    landAcquisitionModuleEnabled && !(formMode === "create" && relationContext === "subsubsection")
  const isCreateMode = formMode === "create"

  const dateLabel = isCreateMode ? "am/bis *" : "am/bis"
  const titleLabel = isCreateMode ? "Titel *" : "Titel"
  const subsubsectionLabel = "Verknüpfungen mit Eintrag"
  const acquisitionAreaLabel = "Verknüpfungen mit Verhandlungsflächen"
  const assignmentAndStatusFields = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="min-w-0 space-y-1">
        <LabeledSelect name="assignedToId" options={assignedToOptions} label="Zuweisen an" />
        {splitView && (
          <p className="text-sm text-gray-500">
            Alle unbestätigten Protokolleinträge können nur Nutzer mit Editierrechten zugewiesen
            werden.
          </p>
        )}
      </div>
      <div className="min-w-0 self-start">
        <LabeledSwitch
          name="editingState"
          values={{
            off: ProjectRecordEditingState.PENDING,
            on: ProjectRecordEditingState.COMPLETED,
          }}
          label="Status"
          contentClassName="pt-2"
          stateLabels={{
            off: "In Bearbeitung",
            on: "Abgeschlossen",
          }}
          trackClassNames={{
            off: "bg-blue-500",
            on: "bg-gray-300",
          }}
        />
      </div>
    </div>
  )

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
      <div className={splitView ? "flex gap-6" : ""}>
        <div className={splitView ? "flex-1 space-y-6" : "space-y-6"}>
          {assignmentAndStatusFields}

          <div className="flex gap-4">
            <div className="w-48">
              <LabeledTextField type="date" name="date" label={dateLabel} placeholder="" />
            </div>
            <div className="flex-1">
              <LabeledTextField name="title" label={titleLabel} />
            </div>
          </div>

          <div
            className={
              landAcquisitionModuleEnabled ? "grid grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"
            }
          >
            {showSubsubsectionField && (
              <LabeledCombobox
                scope="subsubsections"
                items={subsubsectionItems}
                label={subsubsectionLabel}
                placeholder="Eintrag suchen"
              />
            )}
            {showAcquisitionAreaField && (
              <LabeledCombobox
                scope="acquisitionAreas"
                items={acquisitionAreaItems}
                label={acquisitionAreaLabel}
                placeholder="Verhandlungsfläche suchen"
              />
            )}
          </div>
          <LabeledTextareaField name="body" label="Notizen" rows={20} />
          <div className="flex flex-col gap-3">
            <LabeledCheckboxGroup
              scope="projectRecordTopics"
              classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
              items={topicsOptions}
              label="Tags"
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
        </div>

        {emailSource && splitView && <ProjectRecordEmailSource email={emailSource} />}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Dokumente</label>
        <UploadTable
          withAction={false}
          withRelations={false}
          uploads={selectedUploads}
          onDelete={async (uploadId) => {
            const existingUploads = NumberArraySchema.parse(uploadsValue)
            const newUploads = existingUploads.filter((id) => id !== uploadId)
            setValue("uploads", newUploads, { shouldDirty: true })
          }}
        />
        <UploadDropzone
          onUploadComplete={async (newUploadIds) => {
            const existingUploads = NumberArraySchema.parse(uploadsValue)
            const newUploads = [...new Set([...existingUploads, ...newUploadIds])]
            setValue("uploads", newUploads, { shouldDirty: true })
          }}
        />
      </div>

      <SuperAdminLogData data={{ uploadsValue, uploadIds }} />
    </>
  )
}
