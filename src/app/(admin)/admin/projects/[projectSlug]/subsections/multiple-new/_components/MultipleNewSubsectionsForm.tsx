"use client"

import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { GERMANY_VIEW_BOUNDS } from "@/src/core/components/Map/germanyViewBounds"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProject from "@/src/server/projects/queries/getProject"
import createSubsections from "@/src/server/subsections/mutations/createSubsections"
import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import getSubsectionMaxOrder from "@/src/server/subsections/queries/getSubsectionMaxOrder"
import {
  multipleNewSubsectionsFormDefaultValues,
  SubsectionsFormSchema,
} from "@/src/server/subsections/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Subsection } from "@prisma/client"
import { length, lineString } from "@turf/turf"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

const [west, south, east, north] = GERMANY_VIEW_BOUNDS as [number, number, number, number]

export const defaultGeometryForMultipleSubsectionForm = {
  type: "LineString" as const,
  coordinates: [
    [west, south],
    [east, north],
  ],
} satisfies TGetSubsection["geometry"]

export const MultipleNewSubsectionsForm = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })
  const [createSubsectionsMutation] = useMutation(createSubsections)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: multipleNewSubsectionsFormDefaultValues,
    validators: { onSubmit: SubsectionsFormSchema } as never,
    onSubmit: async ({ value }) => {
      const values = value as z.infer<typeof SubsectionsFormSchema>
      const maxOrderSubsections = (await getSubsectionMaxOrder(project.id)) || 0
      const newSubsections: Array<
        { geometry: TGetSubsection["geometry"] } & Pick<
          Subsection,
          "projectId" | "labelPos" | "slug" | "order" | "lengthM"
        >
      > = []
      for (let i = 0; i < Number(values.no); i++) {
        newSubsections.push({
          projectId: project.id,
          labelPos: "bottom",
          slug: `pa${values.prefix}.${maxOrderSubsections + i + 1}`,
          order: maxOrderSubsections + i + 1,
          geometry: defaultGeometryForMultipleSubsectionForm,
          lengthM: Number(
            (
              length(lineString(defaultGeometryForMultipleSubsectionForm.coordinates), {
                units: "kilometers",
              }) * 1000
            ).toFixed(0),
          ),
        })
      }
      try {
        await createSubsectionsMutation({
          projectSlug,
          subsections: newSubsections,
        })
        router.push(`/admin/projects/${projectSlug}/subsections`)
      } catch (error: any) {
        applyFormSubmitResult(
          form,
          improveErrorMessage(error, FORM_ERROR, ["order", "slug"]),
          setFormError,
        )
      }
    },
  })

  return (
    <FormShell form={form} formError={formError} submitText="Erstellen">
      <form.AppField name="prefix">
        {(field) => (
          <field.TextField
            inlineLeadingAddon="pa"
            type="text"
            label="Präfix-Id"
            help="Präfix aller Planungsabschnitte ist 'pa'. Optional kann eine zusätzliche Präfix-Id angegeben werden. Ergebnis: pa[Präfix-Id].[Nummer]"
          />
        )}
      </form.AppField>
      <form.AppField name="no">
        {(field) => (
          <field.NumberField
            step="1"
            label="Anzahl"
            help="Anzahl der im Bulk-Mode erstellten Planungsabschnitte."
          />
        )}
      </form.AppField>
    </FormShell>
  )
}
