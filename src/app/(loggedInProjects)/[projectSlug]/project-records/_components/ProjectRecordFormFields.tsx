"use client"

import { ProjectRecordEmailSource } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordEmailSource"
import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { getUserSelectOptions } from "@/src/app/_components/users/utils/getUserSelectOptions"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { useCoreAppFormContext } from "@/src/core/components/forms/hooks/formContext"
import { useFormValue } from "@/src/core/components/forms/hooks/useFormValue"
import { blueButtonStyles } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text"
import { NumberArraySchema } from "@/src/core/utils/schema-shared"
import getAcquisitionAreas from "@/src/server/acquisitionAreas/queries/getAcquisitionAreas"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import createProjectRecordTopic from "@/src/server/ProjectRecordTopics/mutations/createProjectRecordTopic"
import getProjectRecordTopicsByProject from "@/src/server/ProjectRecordTopics/queries/getProjectRecordTopicsByProject"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ProjectRecordEditingState } from "@prisma/client"
import clsx from "clsx"
import { useState } from "react"

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
  const form = useCoreAppFormContext()
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
  const selectedSubsubsectionsValue = useFormValue("subsubsections")
  const selectedAcquisitionAreasValue = useFormValue("acquisitionAreas")
  const selectedSubsubsectionIds = NumberArraySchema.parse(selectedSubsubsectionsValue)
  const selectedAcquisitionAreaIds = NumberArraySchema.parse(selectedAcquisitionAreasValue)
  const uploadsValue = useFormValue("uploads")
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

  const subsubsectionLabel = "Einträge"
  const showSubsubsectionField = !(formMode === "create" && relationContext === "acquisitionArea")
  const showAcquisitionAreaField =
    landAcquisitionModuleEnabled && !(formMode === "create" && relationContext === "subsubsection")

  const handleNewTopicFormSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!newTopic.trim()) return
    try {
      await createProjectRecordTopicMutation({
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
          <div className="flex gap-4">
            <div className="w-48">
              <form.AppField name="date">
                {(field) => <field.TextField type="date" label="am/bis" placeholder="" />}
              </form.AppField>
            </div>
            <div className="flex-1">
              <form.AppField name="title">
                {(field) => <field.TextField label="Titel" />}
              </form.AppField>
            </div>
          </div>

          <div
            className={
              landAcquisitionModuleEnabled ? "grid grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"
            }
          >
            {showSubsubsectionField && (
              <form.AppField name="subsubsections">
                {(field) => (
                  <field.Combobox optional items={subsubsectionItems} label={subsubsectionLabel} />
                )}
              </form.AppField>
            )}
            {showAcquisitionAreaField && (
              <form.AppField name="acquisitionAreas">
                {(field) => (
                  <field.Combobox
                    optional
                    items={acquisitionAreaItems}
                    label="Verhandlungsflächen"
                  />
                )}
              </form.AppField>
            )}
          </div>
          <form.AppField name="body">
            {(field) => <field.TextareaField optional label="Notizen (Markdown)" rows={20} />}
          </form.AppField>
          <div className="flex flex-col gap-3">
            <form.AppField name="projectRecordTopics">
              {(field) => (
                <field.CheckboxGroup
                  classNameItemWrapper="grid grid-cols-4 gap-1.5 w-full"
                  items={topicsOptions}
                  label="Tags"
                  optional
                />
              )}
            </form.AppField>
            <div className="flex w-full items-end gap-2">
              <div className="grow">
                <label htmlFor="newTopic" className="sr-only">
                  Neues Tag
                </label>
                <input
                  id="newTopic"
                  type="text"
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
          <div className="flex gap-8">
            <div className="space-y-1">
              <form.AppField name="assignedToId">
                {(field) => (
                  <field.SelectField optional options={assignedToOptions} label="Zugewiesen an" />
                )}
              </form.AppField>
              {splitView && (
                <p className="text-sm text-gray-500">
                  Alle unbestätigten Protokolleinträge können nur Nutzer mit Editierrechten
                  zugewiesen werden.
                </p>
              )}
            </div>
            <div className="w-48">
              <form.AppField name="editingState">
                {(field) => (
                  <field.Switch
                    values={{
                      off: ProjectRecordEditingState.PENDING,
                      on: ProjectRecordEditingState.COMPLETED,
                    }}
                    label="Status"
                    stateLabels={{
                      off: "In Bearbeitung",
                      on: "Abgeschlossen",
                    }}
                    trackClassNames={{
                      off: "bg-blue-500",
                      on: "bg-gray-300",
                    }}
                  />
                )}
              </form.AppField>
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
                upload={upload}
                projectSlug={projectSlug}
                size="grid"
                onDeleted={async () => {
                  const existingUploads = NumberArraySchema.parse(uploadsValue)
                  const newUploads = existingUploads.filter((id) => id !== upload.id)
                  form.setFieldValue("uploads", newUploads)
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
                form.setFieldValue("uploads", newUploads)
              }}
            />
          </UploadDropzoneContainer>
        </div>
      </div>

      <SuperAdminLogData data={{ uploadsValue, uploadIds }} />
    </>
  )
}
