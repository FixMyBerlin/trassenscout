"use client"

import { Form, FormProps, LabeledSelect, LabeledTextareaField } from "@/src/core/components/forms"
import { createFormOptions } from "@/src/core/components/forms/_utils/createFormOptions"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { InputNumberOrNullSchema } from "@/src/core/utils/schema-shared"
import { DealAreaGeometrySchema, type TDealAreaGeometrySchema } from "@/src/server/dealAreas/schema"
import getDealAreaStatuses from "@/src/server/dealAreaStatuses/queries/getDealAreaStatuses"
import { useQuery } from "@blitzjs/rpc"
import { z } from "zod"
import { DealAreaGeometryInput } from "./DealAreaGeometryInput"

export const DealAreaFormSchema = z.object({
  description: z.string().nullish(),
  dealAreaStatusId: InputNumberOrNullSchema,
  geometry: DealAreaGeometrySchema,
  type: z.literal("POLYGON").optional(),
})

type Props<S extends z.ZodType<any, any>> = FormProps<S> & {
  parcelGeometry: TDealAreaGeometrySchema
}

export function DealAreaForm<S extends z.ZodType<any, any>>({
  parcelGeometry,
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
      <LabeledSelect
        name="dealAreaStatusId"
        label="Status"
        optional
        options={dealAreaStatusOptions}
      />
      <DealAreaGeometryInput parcelGeometry={parcelGeometry} />
    </Form>
  )
}
