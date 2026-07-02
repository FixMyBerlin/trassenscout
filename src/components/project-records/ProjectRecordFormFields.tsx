import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { NumberArraySchema } from "@/src/components/core/utils/schema-shared"
import { ProjectRecordEmailSource } from "@/src/components/project-records/ProjectRecordEmailSource"
import { getUserSelectOptions } from "@/src/components/shared/app/users/utils/getUserSelectOptions"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/components/uploads/UploadDropzoneContainer"
import { UploadPreviewClickable } from "@/src/components/uploads/UploadPreviewClickable"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { acquisitionAreasQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasQueryOptions"
import { createLookupRowFn } from "@/src/server/adminLookupTables/adminLookupTables.functions"
import { adminLookupRowsQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { uploadsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"

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
  disableSuspenseQueries: _disableSuspenseQueries = false,
}: Props) => {
  const form = useCoreAppFormContext()
  const queryClient = useQueryClient()
  const queryBehavior = {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  } as const

  const { data: subsubsections = [] } = useQuery({
    ...subsubsectionsQueryOptions({ projectSlug }),
    ...queryBehavior,
  })
  const { data: acquisitionAreas = [] } = useQuery({
    ...acquisitionAreasQueryOptions({ projectSlug }),
    enabled: landAcquisitionModuleEnabled,
    ...queryBehavior,
  })
  const { data: users = [] } = useQuery({
    ...projectUsersQueryOptions({
      projectSlug,
      role: splitView ? "EDITOR" : undefined,
    }),
    ...queryBehavior,
  })
  const projectRecordTopicsQuery = adminLookupRowsQueryOptions({
    projectSlug,
    table: "projectRecordTopics",
  })
  const { data: projectRecordTopics = [] } = useQuery({
    ...projectRecordTopicsQuery,
    ...queryBehavior,
  })
  const [newTopic, setNewTopic] = useState("")
  const createProjectRecordTopicMutation = useMutation({ mutationFn: createLookupRowFn })
  const uploadsValue = useFormValue("uploads")
  const uploadIds = NumberArraySchema.parse(uploadsValue)

  const { data: allUploads = [] } = useQuery({
    ...uploadsQueryOptions({ projectSlug }),
    enabled: uploadIds.length > 0,
    ...queryBehavior,
  })
  const selectedUploads = allUploads.filter((upload) => uploadIds.includes(upload.id))

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

  const subsubsectionLabel = "Maßnahmen"
  const showSubsubsectionField = !(formMode === "create" && relationContext === "acquisitionArea")
  const showAcquisitionAreaField =
    landAcquisitionModuleEnabled && !(formMode === "create" && relationContext === "subsubsection")

  const handleNewTopicFormSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!newTopic.trim()) return
    try {
      const createdTopic = await createProjectRecordTopicMutation.mutateAsync({
        data: {
          projectSlug,
          table: "projectRecordTopics",
          data: { title: newTopic.trim() },
        },
      })
      await queryClient.invalidateQueries({ queryKey: projectRecordTopicsQuery.queryKey })

      const currentTopics = Array.isArray(form.getFieldValue("projectRecordTopics"))
        ? (form.getFieldValue("projectRecordTopics") as string[]).map(String)
        : []
      const newTopicId = String(createdTopic.id)
      if (!currentTopics.includes(newTopicId)) {
        form.setFieldValue("projectRecordTopics", [...currentTopics, newTopicId])
      }
    } catch (error: unknown) {
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
                className={twJoin(primaryButtonClassName, "shrink-0 px-3! py-2!")}
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
              onUploadComplete={async (newUploadIds: number[]) => {
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
