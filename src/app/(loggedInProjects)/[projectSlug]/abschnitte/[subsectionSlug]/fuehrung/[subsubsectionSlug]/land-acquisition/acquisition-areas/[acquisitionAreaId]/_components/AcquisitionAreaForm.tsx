"use client"

import { LinkWithFormDirtyConfirm } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/_components/LinkWithFormDirtyConfirm"
import { AcquisitionAreaGeometryInput } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/[acquisitionAreaId]/_components/AcquisitionAreaGeometryInput"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { createFormOptions } from "@/src/core/components/forms/utils/createFormOptions"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import {
  acquisitionAreaFormDefaultValues,
  AcquisitionAreaFormSchema,
  type TAcquisitionAreaGeometrySchema,
} from "@/src/server/acquisitionAreas/schema"
import getAcquisitionAreaStatuses from "@/src/server/acquisitionAreaStatuses/queries/getAcquisitionAreaStatuses"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { useQuery } from "@blitzjs/rpc"
import { Route } from "next"
import { ReactNode, useState } from "react"
import { z } from "zod"

export { AcquisitionAreaFormSchema }

export type AcquisitionAreaFormProps<S extends z.ZodType<any, any>> = {
  schema: S
  initialValues?: Partial<z.infer<S>>
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>
  submitText: string
  resetOnSubmit?: boolean
  className?: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  submitDisabled?: boolean
  submitClassName?: string
  showFormDebug?: boolean
  parcelGeometry: TAcquisitionAreaGeometrySchema
  subsubsectionGeometry: SupportedGeometry
}

export function AcquisitionAreaForm<S extends z.ZodType<any, any>>({
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
  submitDisabled,
  submitClassName,
  showFormDebug,
}: AcquisitionAreaFormProps<S>) {
  const projectSlug = useProjectSlug()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...acquisitionAreaFormDefaultValues, ...initialValues },
    validators: { onSubmit: schema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value)) || {}
      applyFormSubmitResult(form, result, setFormError)
      if (resetOnSubmit && !result.FORM_ERROR) {
        form.reset()
        setFormError(null)
      }
    },
  })

  const [{ acquisitionAreaStatuses }] = useQuery(
    getAcquisitionAreaStatuses,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
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
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
      showFormDebug={showFormDebug}
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
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/acquisition-area-status` as Route}
          className="py-2"
        >
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
