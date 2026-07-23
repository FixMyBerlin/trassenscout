import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { ReactNode, useState } from "react"
import { z } from "zod"
import { AcquisitionAreaGeometryInput } from "@/src/components/abschnitte/acquisition-areas/AcquisitionAreaGeometryInput"
import { LinkWithFormDirtyConfirm } from "@/src/components/abschnitte/LinkWithFormDirtyConfirm"
import { lookupTableRows } from "@/src/components/abschnitte/utils/lookupTableRows"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { createFormOptions } from "@/src/components/core/components/forms/utils/createFormOptions"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import {
  acquisitionAreaFormDefaultValues,
  AcquisitionAreaFormSchema,
  type TAcquisitionAreaGeometrySchema,
} from "@/src/shared/acquisitionAreas/schemas"
import { SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export { AcquisitionAreaFormSchema }

export type AcquisitionAreaFormProps<S extends z.ZodTypeAny> = {
  schema: S
  initialValues?: Partial<z.infer<S>>
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>
  submitText: string
  resetOnSubmit?: boolean
  className?: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  backLink: ReactNode | null
  submitDisabled?: boolean
  submitClassName?: string
  parcelGeometry: TAcquisitionAreaGeometrySchema
  subsubsectionGeometry: SupportedGeometry
}

export function AcquisitionAreaForm<S extends z.ZodTypeAny>({
  parcelGeometry,
  subsubsectionGeometry,
  schema,
  initialValues,
  onSubmit,
  submitText,
  resetOnSubmit,
  className,
  actionBarLeft,
  actionBarRight,
  backLink,
  submitDisabled,
  submitClassName,
}: AcquisitionAreaFormProps<S>) {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...acquisitionAreaFormDefaultValues, ...initialValues },
    validators: { onSubmit: schema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value as z.infer<S>)) || {}
      applyFormSubmitResult(form, result, setFormError)
      if (resetOnSubmit && !result.FORM_ERROR) {
        form.reset()
        setFormError(null)
      }
    },
  })

  const { data: statusData } = useQuery({
    ...adminLookupRowsWithCountQueryOptions({ projectSlug, table: "acquisitionAreaStatuses" }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const acquisitionAreaStatuses = lookupTableRows<{ id: number; title: string }>(
    statusData as Parameters<typeof lookupTableRows>[0],
    "acquisitionAreaStatuses",
  )

  const acquisitionAreaStatusOptions = createFormOptions(acquisitionAreaStatuses, "Status", {
    optional: true,
  })

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText={submitText}
      className={className}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      backLink={backLink}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
    >
      <form.AppField name="description">
        {(field) => <field.TextareaField label="Beschreibung" optional />}
      </form.AppField>
      <div className="flex items-end gap-5">
        <form.AppField name="acquisitionAreaStatusId">
          {(field) => (
            <field.SelectField
              label="Status"
              optional
              options={acquisitionAreaStatusOptions}
              outerProps={{ className: "grow" }}
            />
          )}
        </form.AppField>
        <LinkWithFormDirtyConfirm to={`/${projectSlug}/acquisition-area-status`} className="py-2">
          Status verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <AcquisitionAreaGeometryInput
        parcelGeometry={parcelGeometry}
        subsubsectionGeometry={subsubsectionGeometry}
      />
    </FormShell>
  )
}
