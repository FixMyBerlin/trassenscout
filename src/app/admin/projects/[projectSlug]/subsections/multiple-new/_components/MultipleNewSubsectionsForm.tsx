"use client"
import { Form, FORM_ERROR, LabeledTextField } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProject from "@/src/server/projects/queries/getProject"
import createSubsections from "@/src/server/subsections/mutations/createSubsections"
import getSubsectionMaxOrder from "@/src/server/subsections/queries/getSubsectionMaxOrder"
import { SubsectionsFormSchema } from "@/src/server/subsections/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Subsection } from "@prisma/client"
import { length, lineString } from "@turf/turf"
import { useRouter } from "next/navigation"

export const defaultGeometryForMultipleSubsectionForm = [
  [5.98865807458, 47.3024876979],
  [15.0169958839, 54.983104153],
] satisfies [[number, number], [number, number]]

export const MultipleNewSubsectionsForm = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })
  const [createSubsectionsMutation] = useMutation(createSubsections)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    const maxOrderSubsections = (await getSubsectionMaxOrder(project.id)) || 0
    const newSubsections: Array<
      { geometry: [number, number][] } & Pick<
        Subsection,
        "projectId" | "labelPos" | "start" | "end" | "slug" | "order" | "lengthKm" | "isFinalRoute"
      >
    > = []
    for (let i = 0; i < Number(values.no); i++) {
      newSubsections.push({
        projectId: project.id,
        labelPos: "bottom",
        start: "unbekannt",
        end: "unbekannt",
        slug: `pa${values.prefix}.${maxOrderSubsections + i + 1}`,
        order: maxOrderSubsections + i + 1,
        geometry: defaultGeometryForMultipleSubsectionForm,
        lengthKm: length(lineString(defaultGeometryForMultipleSubsectionForm)),
        isFinalRoute: true,
      })
    }
    try {
      await createSubsectionsMutation({
        projectSlug,
        subsections: newSubsections,
      })
      router.push(`/admin/projects/${projectSlug}/subsections`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  return (
    <Form submitText="Erstellen" schema={SubsectionsFormSchema} onSubmit={handleSubmit}>
      <LabeledTextField
        inlineLeadingAddon="pa"
        type="text"
        name="prefix"
        label="Präfix-Id"
        help="Präfix aller Planungsabschnitte ist 'pa'. Optional kann eine zusätzliche Präfix-Id angegeben werden. Ergebnis: pa[Präfix-Id].[Nummer]"
      />
      <LabeledTextField
        type="number"
        step="1"
        name="no"
        label="Anzahl"
        help="Anzahl der im Bulk-Mode erstellten Planungsabschnitte."
      />
    </Form>
  )
}
