import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { length, lineString } from "@turf/turf"
import { useState } from "react"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { GERMANY_VIEW_BOUNDS } from "@/src/components/core/components/Map/germanyViewBounds"
import { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import {
  createSubsectionsFn,
  getSubsectionMaxOrderFn,
} from "@/src/server/subsections/subsections.functions"
import type { CreateSubsectionsInput } from "@/src/server/subsections/subsections.inputSchemas"
import type { SubsectionBySlug } from "@/src/server/subsections/types"
import {
  subsectionsFormDefaultValues,
  SubsectionsFormSchema,
} from "@/src/shared/subsections/schemas"

const [west, south, east, north] = GERMANY_VIEW_BOUNDS as [number, number, number, number]

export const defaultGeometryForMultipleSubsectionForm = {
  type: "LineString" as const,
  coordinates: [
    [west, south],
    [east, north],
  ],
} satisfies SubsectionBySlug["geometry"]

type Props = {
  projectSlug: string
}

export const MultipleNewSubsectionsForm = ({ projectSlug }: Props) => {
  const navigate = useNavigate()
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const createSubsectionsMutation = useMutation({ mutationFn: createSubsectionsFn })
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: subsectionsFormDefaultValues,
    validators: { onSubmit: SubsectionsFormSchema } as never,
    onSubmit: async ({ value }) => {
      const values = value as z.infer<typeof SubsectionsFormSchema>
      const maxOrderSubsections = (await getSubsectionMaxOrderFn({ data: { projectSlug } })) || 0
      const newSubsections: CreateSubsectionsInput["subsections"] = []
      for (let i = 0; i < Number(values.no); i++) {
        newSubsections.push({
          projectId: project.id,
          type: GeometryTypeEnum.LINE,
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
          networkHierarchyId: null,
        })
      }
      try {
        await createSubsectionsMutation.mutateAsync({
          data: {
            projectSlug,
            subsections: newSubsections,
          },
        })
        navigate({ to: `/admin/projects/${projectSlug}/subsections` })
      } catch (error: unknown) {
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
