"use client"

import { Form, FormProps, LabeledSelect, LabeledTextareaField } from "@/src/core/components/forms"
import { createFormOptions } from "@/src/core/components/forms/_utils/createFormOptions"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import { DealAreaGeometrySchema, type TDealAreaGeometrySchema } from "@/src/server/dealAreas/schema"
import getDealAreaStatuses from "@/src/server/dealAreaStatuses/queries/getDealAreaStatuses"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { useQuery } from "@blitzjs/rpc"
import { Route } from "next"
import { z } from "zod"
import { LinkWithFormDirtyConfirm } from "../../../../_components/LinkWithFormDirtyConfirm"
import { DealAreaGeometryInput } from "./DealAreaGeometryInput"

export const DealAreaFormSchema = z.object({
  description: z.string().nullish(),
  dealAreaStatusId: InputNumberOrNullSchema,
  geometry: DealAreaGeometrySchema,
  type: z.literal("POLYGON").optional(),
})

type Props<S extends z.ZodType<any, any>> = FormProps<S> & {
  parcelGeometry: TDealAreaGeometrySchema
  subsubsectionGeometry: SupportedGeometry
}

export function DealAreaForm<S extends z.ZodType<any, any>>({
  parcelGeometry,
  subsubsectionGeometry,
  ...props
}: Props<S>) {
  const projectSlug = useProjectSlug()
  const [{ dealAreaStatuses }] = useQuery(
    getDealAreaStatuses,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const dealAreaStatusOptions = createFormOptions(dealAreaStatuses, "Status", { optional: true })

  return (
    <Form<S> {...props}>
      <LabeledTextareaField name="description" label="Beschreibung" optional />
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="dealAreaStatusId"
          label="Status"
          optional
          options={dealAreaStatusOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/deal-area-status` as Route}
          className="py-2"
        >
          Status verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <DealAreaGeometryInput
        parcelGeometry={parcelGeometry}
        subsubsectionGeometry={subsubsectionGeometry}
      />
    </Form>
  )
}
