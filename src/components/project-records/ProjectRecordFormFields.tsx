import { useQuery } from "@tanstack/react-query"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { NumberArraySchema } from "@/src/components/core/utils/schema-shared"
import { useSessionUploadCleanup } from "@/src/components/project-records/hooks/useSessionUploadCleanup"
import { ProjectRecordEmailSource } from "@/src/components/project-records/ProjectRecordEmailSource"
import { getUserComboboxItems } from "@/src/components/shared/app/users/utils/getUserSelectOptions"
import { TagsFormSection } from "@/src/components/tags/TagsFormSection"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadTable } from "@/src/components/uploads/UploadTable"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { acquisitionAreasQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasQueryOptions"
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
  const { trackSessionUploads } = useSessionUploadCleanup({ projectSlug })
  const uploadsValue = useFormValue("uploads")
  const uploadIds = NumberArraySchema.parse(uploadsValue)

  const { data: allUploads = [] } = useQuery({
    ...uploadsQueryOptions({ projectSlug }),
    enabled: uploadIds.length > 0,
    ...queryBehavior,
  })
  const selectedUploads = allUploads.filter((upload) => uploadIds.includes(upload.id))

  const assignedToItems = getUserComboboxItems(users)

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
        <form.AppField name="assignedToId">
          {(field) => (
            <field.ComboboxSingle
              items={assignedToItems}
              label="Zuweisen an"
              placeholder="Nutzer suchen"
            />
          )}
        </form.AppField>
        {splitView && (
          <p className="text-sm text-gray-500">
            Alle unbestätigten Protokolleinträge können nur Nutzer mit Editierrechten zugewiesen
            werden.
          </p>
        )}
      </div>
      <div className="min-w-0 self-start">
        <form.AppField name="editingState">
          {(field) => (
            <field.Switch
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
          )}
        </form.AppField>
      </div>
    </div>
  )

  return (
    <>
      <div className={splitView ? "flex gap-6" : ""}>
        <div className={splitView ? "flex-1 space-y-6" : "space-y-6"}>
          {assignmentAndStatusFields}

          <div className="flex gap-4">
            <div className="w-48">
              <form.AppField name="date">
                {(field) => <field.TextField type="date" label={dateLabel} placeholder="" />}
              </form.AppField>
            </div>
            <div className="flex-1">
              <form.AppField name="title">
                {(field) => <field.TextField label={titleLabel} />}
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
                  <field.Combobox
                    items={subsubsectionItems}
                    label={subsubsectionLabel}
                    placeholder="Eintrag suchen"
                  />
                )}
              </form.AppField>
            )}
            {showAcquisitionAreaField && (
              <form.AppField name="acquisitionAreas">
                {(field) => (
                  <field.Combobox
                    items={acquisitionAreaItems}
                    label={acquisitionAreaLabel}
                    placeholder="Verhandlungsfläche suchen"
                  />
                )}
              </form.AppField>
            )}
          </div>
          <form.AppField name="body">
            {(field) => <field.TextareaField label="Notizen" rows={20} />}
          </form.AppField>
          <TagsFormSection projectSlug={projectSlug} showManageLink />
        </div>

        {emailSource && splitView && <ProjectRecordEmailSource email={emailSource} />}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Dokumente</label>
        <UploadTable
          projectSlug={projectSlug}
          withAction={false}
          withRelations={false}
          uploads={selectedUploads}
          onDelete={async (uploadId) => {
            const existingUploads = NumberArraySchema.parse(uploadsValue)
            const newUploads = existingUploads.filter((id) => id !== uploadId)
            form.setFieldValue("uploads", newUploads)
          }}
        />
        <UploadDropzone
          projectSlug={projectSlug}
          onUploadComplete={async (newUploadIds: number[]) => {
            trackSessionUploads(newUploadIds)
            const existingUploads = NumberArraySchema.parse(uploadsValue)
            const newUploads = [...new Set([...existingUploads, ...newUploadIds])]
            form.setFieldValue("uploads", newUploads)
          }}
        />
      </div>

      <SuperAdminLogData data={{ uploadsValue, uploadIds }} />
    </>
  )
}
