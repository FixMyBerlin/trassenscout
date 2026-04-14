"use client"

import { AcquisitionAreaGeometryInput } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/_components/AcquisitionAreaGeometryInput"
import { Form, FormProps, LabeledSelect, LabeledTextareaField } from "@/src/core/components/forms"
import { createFormOptions } from "@/src/core/components/forms/_utils/createFormOptions"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import {
  AcquisitionAreaGeometrySchema,
  type TAcquisitionAreaGeometrySchema,
} from "@/src/server/acquisitionAreas/schema"
import getAcquisitionAreaStatuses from "@/src/server/acquisitionAreaStatuses/queries/getAcquisitionAreaStatuses"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { useQuery } from "@blitzjs/rpc"
import { Route } from "next"
import { z } from "zod"
import { LinkWithFormDirtyConfirm } from "../../../../_components/LinkWithFormDirtyConfirm"

export const AcquisitionAreaFormSchema = z.object({
  description: z.string().nullish(),
  acquisitionAreaStatusId: InputNumberOrNullSchema,
  geometry: AcquisitionAreaGeometrySchema,
  type: z.literal("POLYGON").optional(),
})

type Props<S extends z.ZodType<any, any>> = FormProps<S> & {
  parcelGeometry: TAcquisitionAreaGeometrySchema
  subsubsectionGeometry: SupportedGeometry
}

export function AcquisitionAreaForm<S extends z.ZodType<any, any>>({
  parcelGeometry,
  subsubsectionGeometry,
  ...props
}: Props<S>) {
  const projectSlug = useProjectSlug()
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
    <Form<S> {...props}>
      <LabeledTextareaField name="description" label="Beschreibung" optional />
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="acquisitionAreaStatusId"
          label="Status"
          optional
          options={acquisitionAreaStatusOptions}
          outerProps={{ className: "grow" }}
        />
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
    </Form>
  )
}
