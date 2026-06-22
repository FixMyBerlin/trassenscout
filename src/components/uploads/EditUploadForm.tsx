import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { FormDirtyStateReporter } from "@/src/components/core/components/forms/FormDirtyStateReporter"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { formatFileSize } from "@/src/components/core/utils/formatFileSize"
import { acquisitionAreasQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasQueryOptions"
import type { AcquisitionAreasList } from "@/src/server/acquisitionAreas/types"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import type { SubsubsectionsList } from "@/src/server/subsubsections/types"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { updateUploadFn } from "@/src/server/uploads/uploads.functions"
import { uploadsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"
import {
  uploadFormDefaultValues,
  UploadFormSchema,
  UploadSchema,
} from "@/src/shared/uploads/schemas"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import { DeleteUploadActionBar } from "./DeleteUploadActionBar"
import { LuckyCloudActionBar } from "./LuckyCloudActionBar"
import { LuckyCloudDocumentLink } from "./LuckyCloudDocumentLink"
import { LuckyCloudNotice } from "./LuckyCloudNotice"
import { UploadLocationMap } from "./map/UploadLocationMap"
import { SummaryField } from "./SummaryField"
import { SuperAdminLuckyCloud } from "./SuperAdminLuckyCloud"
import { UploadAuthorAndDates } from "./UploadAuthorAndDates"
import { UploadPreview } from "./UploadPreview"
import type { UploadWithRelations } from "./uploadTypes"
import { UploadVerknuepfungen } from "./UploadVerknuepfungen"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type UploadSubsectionFieldsProps = {
  landAcquisitionModuleEnabled: boolean
  subsubsections: SubsubsectionsList
  acquisitionAreas: AcquisitionAreasList
}

const UploadSubsectionFields = ({
  acquisitionAreas,
  landAcquisitionModuleEnabled,
  subsubsections,
}: UploadSubsectionFieldsProps) => {
  const form = useCoreAppFormContext()

  const subsubsectionCheckboxItems = [...subsubsections]
    .sort((a, b) => {
      const subsectionCompare = a.subsection.slug.localeCompare(b.subsection.slug)
      if (subsectionCompare !== 0) return subsectionCompare
      return a.slug.localeCompare(b.slug)
    })
    .map((ss) => ({
      value: String(ss.id),
      label: `${shortTitle(ss.slug)} (${shortTitle(ss.subsection.slug)})`,
    }))

  const acquisitionAreaCheckboxItems = [...acquisitionAreas]
    .sort((a, b) => {
      const subsectionCompare = a.subsubsection.subsection.slug.localeCompare(
        b.subsubsection.subsection.slug,
      )
      if (subsectionCompare !== 0) return subsectionCompare
      const subsubCompare = a.subsubsection.slug.localeCompare(b.subsubsection.slug)
      if (subsubCompare !== 0) return subsubCompare
      return a.id - b.id
    })
    .map((acquisitionArea) => ({
      value: String(acquisitionArea.id),
      label: `${acquisitionArea.id} - Flurstücknr. ${acquisitionArea.parcel.alkisParcelId} (${shortTitle(acquisitionArea.subsubsection.slug)})`,
    }))

  return (
    <div className="flex flex-col gap-4">
      <form.AppField name="subsubsections">
        {(field) => (
          <field.Combobox
            label="Zuordnung zu Einträgen"
            optional
            items={subsubsectionCheckboxItems}
          />
        )}
      </form.AppField>
      {landAcquisitionModuleEnabled && (
        <form.AppField name="acquisitionAreas">
          {(field) => (
            <field.Combobox
              label="Zuordnung zu Verhandlungsflächen"
              optional
              items={acquisitionAreaCheckboxItems}
            />
          )}
        </form.AppField>
      )}
    </div>
  )
}

type Props = {
  upload: UploadWithRelations
  returnPath: string
  returnText: string
  showDelete?: boolean
  hideBackLink?: boolean
  onSuccess?: () => void | Promise<void>
  onDirtyChange?: (isDirty: boolean) => void
  onSubmittingChange?: (isSubmitting: boolean) => void
}

const createUploadFormValues = (upload: UploadWithRelations) => ({
  title: upload.title,
  externalUrl: upload.externalUrl,
  summary: upload.summary,
  subsubsections: upload.subsubsections?.map((s) => String(s.id)) ?? [],
  acquisitionAreas: upload.acquisitionAreas?.map((a) => String(a.id)) ?? [],
  projectRecordEmailId: upload.projectRecordEmailId,
  mimeType: upload.mimeType,
  latitude: upload.latitude,
  longitude: upload.longitude,
  collaborationUrl: upload.collaborationUrl,
  collaborationPath: upload.collaborationPath,
  surveyResponseId: upload.surveyResponseId,
  projectRecords: upload.projectRecords?.map((projectRecord) => projectRecord.id) ?? [],
})

const getUploadFormKey = (upload: UploadWithRelations) => {
  const lastUpdatedAt = upload.updatedAt ?? upload.createdAt
  return `${upload.id}-${lastUpdatedAt.toISOString()}`
}

export const EditUploadForm = ({
  upload,
  returnPath,
  returnText,
  showDelete = true,
  hideBackLink = false,
  onSuccess,
  onDirtyChange,
  onSubmittingChange,
}: Props) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { data: subsubsectionsData } = useSuspenseQuery(subsubsectionsQueryOptions({ projectSlug }))
  const { data: acquisitionAreasData } = useSuspenseQuery(
    acquisitionAreasQueryOptions({ projectSlug }),
  )
  const updateUploadMutation = useMutation({ mutationFn: updateUploadFn })

  const initialValues = createUploadFormValues(upload)
  const formKey = getUploadFormKey(upload)

  const form = useAppForm({
    defaultValues: { ...uploadFormDefaultValues, ...initialValues },
    validators: { onSubmit: UploadFormSchema } as never,
    onSubmit: async ({ value }) => {
      onSubmittingChange?.(true)
      try {
        await updateUploadMutation.mutateAsync({
          data: {
            ...(value as unknown as z.infer<typeof UploadSchema>),
            id: upload.id,
            projectSlug,
          },
        })

        const nextProjectRecordIds = Array.isArray(value.projectRecords) ? value.projectRecords : []
        const projectRecordIdsToRefresh = new Set<number>([
          ...(upload.projectRecords?.map((projectRecord) => projectRecord.id) ?? []),
          ...nextProjectRecordIds,
        ])

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: uploadQueryOptions({ projectSlug, id: upload.id }).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: uploadsQueryOptions({ projectSlug }).queryKey,
          }),
          ...Array.from(projectRecordIdsToRefresh).map((projectRecordId) =>
            queryClient.invalidateQueries({
              queryKey: ["projectRecord", projectSlug, projectRecordId],
            }),
          ),
        ])

        if (onSuccess) {
          await onSuccess()
        } else {
          void navigate({ to: returnPath })
        }
      } catch (error: unknown) {
        onSubmittingChange?.(false)
        console.error(error)
        applyFormSubmitResult(
          form,
          { [FORM_ERROR]: error instanceof Error ? error.message : String(error) },
          setFormError,
        )
      }
    },
  })

  return (
    <>
      <div className="flex flex-col gap-6 sm:gap-10">
        <FormShell
          key={formKey}
          form={form}
          formError={formError}
          className="grow"
          submitText="Speichern"
          submitDisabled={isGeneratingSummary}
          actionBarRight={
            <>
              <LuckyCloudActionBar upload={upload} projectSlug={projectSlug} />
              {showDelete ? (
                <DeleteUploadActionBar
                  projectSlug={projectSlug}
                  uploadId={upload.id}
                  uploadTitle={upload.title}
                  returnPath={returnPath}
                />
              ) : (
                <SuperAdminBox>
                  <DeleteUploadActionBar
                    projectSlug={projectSlug}
                    uploadId={upload.id}
                    uploadTitle={upload.title}
                    returnPath={returnPath}
                  />
                </SuperAdminBox>
              )}
            </>
          }
        >
          <FormDirtyStateReporter onDirtyChange={onDirtyChange} />
          <div className="flex justify-center sm:block">
            <div className="flex flex-col gap-10 sm:flex-row">
              <UploadPreview
                uploadId={upload.id}
                projectSlug={projectSlug}
                size="grid"
                showTitle={false}
              />
              <div className="grow space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="filename" className="block text-sm font-medium text-gray-700">
                      Dateiname {upload.fileSize && "(Größe)"}
                    </label>{" "}
                    <p className="text-sm text-gray-500">
                      {getFilenameFromS3(upload.externalUrl)}
                      {upload.fileSize && ` (${formatFileSize(upload.fileSize)})`}
                    </p>
                  </div>
                  <LuckyCloudDocumentLink collaborationUrl={upload.collaborationUrl} />
                </div>

                <form.AppField name="title">
                  {(field) => <field.TextField type="text" label="Kurzbeschreibung" />}
                </form.AppField>
              </div>
            </div>
          </div>
          <UploadSubsectionFields
            acquisitionAreas={acquisitionAreasData}
            landAcquisitionModuleEnabled={upload.project?.landAcquisitionModuleEnabled ?? false}
            subsubsections={subsubsectionsData}
          />
          {upload.id && (
            <SummaryField
              uploadId={upload.id}
              mimeType={upload.mimeType}
              isGeneratingSummary={isGeneratingSummary}
              setIsGeneratingSummary={setIsGeneratingSummary}
              isAiEnabled={upload.project?.aiEnabled ?? false}
              initialSummary={upload.summary}
            />
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Standort (optional)
            </label>
            <p className="mb-2 text-sm text-gray-500">
              Dokumente und Bilder lassen sich unabhängig von Planungsabschnitten oder Einträgen auf
              der Karte verorten. <br />
              Sobald ein Standort gesetzt ist, erscheint das Dokument auf der Karte.
            </p>
            <UploadLocationMap excludeUploadId={upload.id} />
          </div>

          <LuckyCloudNotice collaborationUrl={upload.collaborationUrl} mimeType={upload.mimeType} />
        </FormShell>
      </div>

      <SuperAdminLuckyCloud upload={upload} projectSlug={projectSlug} />
      {!hideBackLink && <BackLink to={returnPath} text={returnText} />}

      <UploadAuthorAndDates
        className="mt-4"
        createdBy={upload.createdBy}
        createdAt={upload.createdAt}
        updatedBy={upload.updatedBy ?? undefined}
        updatedAt={upload.updatedAt ?? undefined}
      />
      <h4 className="mt-4 text-sm font-medium">Verknüpfungen:</h4>
      <UploadVerknuepfungen
        projectSlug={projectSlug}
        landAcquisitionModuleEnabled={upload.project?.landAcquisitionModuleEnabled ?? false}
        subsubsections={upload.subsubsections}
        acquisitionAreas={upload.acquisitionAreas}
        projectRecords={upload.projectRecords}
        projectRecordEmail={upload.projectRecordEmail}
        surveyResponse={upload.surveyResponse}
      />

      <SuperAdminLogData data={{ upload, returnPath, returnText }} />
    </>
  )
}
