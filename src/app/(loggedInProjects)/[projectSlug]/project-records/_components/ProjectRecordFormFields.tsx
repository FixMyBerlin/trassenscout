"use client"

import { ProjectRecordEmailSource } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordEmailSource"
import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { getUserSelectOptions } from "@/src/app/_components/users/utils/getUserSelectOptions"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
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
import getAcquisitionAreas from "@/src/server/acquisitionAreas/queries/getAcquisitionAreas"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"

type Props = {
  splitView?: boolean
  projectSlug: string
  landAcquisitionModuleEnabled?: boolean
  emailSource?: {
    from: string | null
    subject: string | null
    date: Date | null
    textBody: string | null
    uploads: { id: number; title: string }[]
  } | null
}

export const ProjectRecordFormFields = ({
  projectSlug,
  emailSource,
  splitView,
  landAcquisitionModuleEnabled = false,
}: Props) => {
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ subsubsections }] = useQuery(getSubsubsections, { projectSlug })
  const [acquisitionAreas = []] = useQuery(
    getAcquisitionAreas,
    { projectSlug },
    { enabled: landAcquisitionModuleEnabled },
  )
  const [users] = useQuery(getProjectUsers, { projectSlug, role: "EDITOR" })
  const [{ projectRecordTopics }, { refetch: refetchTopics }] = useQuery(
    getProjectRecordTopicsByProject,
    { projectSlug },
  )
  const [newTopic, setNewTopic] = useState("")
  const [createProjectRecordTopicMutation] = useMutation(createProjectRecordTopic)
  const { watch, setValue } = useFormContext()
  const subsectionId = watch("subsectionId")
  const subsubsectionId = watch("subsubsectionId")
  const acquisitionAreaId = watch("acquisitionAreaId")
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

  const assignedToOptions = getUserSelectOptions(users)

  const subsubsectionOptions: [string | number, string][] = subsubsections
    .filter((subsubsection) => (subsectionId ? subsubsection.subsectionId == subsectionId : true))
    .sort((a, b) => a.subsection.slug.localeCompare(b.subsection.slug))
    .map((subsubsection) => [
      subsubsection.id,
      shortTitle(`${subsubsection.slug} (${subsubsection.subsection.slug})`),
    ])
  subsubsectionOptions.unshift(["", "Keine Angabe"])

  const selectedSubsectionId = subsectionId ? Number(subsectionId) : null
  const selectedSubsubsectionId = subsubsectionId ? Number(subsubsectionId) : null
  const selectedAcquisitionAreaId = acquisitionAreaId ? Number(acquisitionAreaId) : null

  const filteredAcquisitionAreas = acquisitionAreas.filter((acquisitionArea) => {
    if (selectedSubsubsectionId) return acquisitionArea.subsubsectionId === selectedSubsubsectionId
    if (selectedSubsectionId) {
      return acquisitionArea.subsubsection.subsectionId === selectedSubsectionId
    }
    return true
  })

  const acquisitionAreaOptions: [string | number, string][] = filteredAcquisitionAreas.map(
    (acquisitionArea) => [
      acquisitionArea.id,
      `${acquisitionArea.id} ${acquisitionArea.parcel.alkisParcelId} (${shortTitle(
        acquisitionArea.subsubsection.slug,
      )}/${shortTitle(acquisitionArea.subsubsection.subsection.slug)})`,
    ],
  )
  acquisitionAreaOptions.unshift(["", "Keine Angabe"])

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

  useEffect(() => {
    if (!landAcquisitionModuleEnabled || !selectedAcquisitionAreaId) return
    const stillCompatible = filteredAcquisitionAreas.some(
      (acquisitionArea) => acquisitionArea.id === selectedAcquisitionAreaId,
    )
    if (!stillCompatible) {
      setValue("acquisitionAreaId", null, { shouldDirty: true })
    }
  }, [filteredAcquisitionAreas, landAcquisitionModuleEnabled, selectedAcquisitionAreaId, setValue])

  return (
    <>
      <div className={splitView ? "flex gap-6" : ""}>
        <div className={splitView ? "flex-1 space-y-6" : "space-y-6"}>
          <div className="flex gap-4">
            <div className="w-48">
              <LabeledTextField type="date" name="date" label="am/bis" placeholder="" />
            </div>
            <div className="flex-1">
              <LabeledTextField name="title" label="Titel" />
            </div>
          </div>

          <div
            className={
              landAcquisitionModuleEnabled ? "grid grid-cols-3 gap-4" : "grid grid-cols-2 gap-4"
            }
          >
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
            {landAcquisitionModuleEnabled && (
              <LabeledSelect
                optional
                name="acquisitionAreaId"
                options={acquisitionAreaOptions}
                label="Zuordnung zur Verhandlungsfläche"
              />
            )}
          </div>
          <LabeledTextareaField name="body" optional label="Notizen (Markdown)" rows={20} />
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
          <LabeledSelect
            optional
            name="assignedToId"
            options={assignedToOptions}
            label="Zugewiesen an"
          />
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
                  setValue("uploads", newUploads, { shouldDirty: true })
                }}
              />
            )
          })}
          <UploadDropzoneContainer className="col-span-2 h-40 border border-gray-300 p-2">
            <UploadDropzone
              fillContainer
              onUploadComplete={async (newUploadIds) => {
                // Add new upload IDs to the form, ensuring all are numbers
                const existingUploads = NumberArraySchema.parse(uploadsValue)
                const newUploads = [...new Set([...existingUploads, ...newUploadIds])]
                setValue("uploads", newUploads, { shouldDirty: true })
              }}
            />
          </UploadDropzoneContainer>
        </div>
      </div>

      <SuperAdminLogData data={{ subsectionId, uploadsValue, uploadIds }} />
    </>
  )
}
