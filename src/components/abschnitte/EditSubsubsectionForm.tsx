import { useMutation } from "@tanstack/react-query"
import { getRouteApi, useNavigate, useRouter } from "@tanstack/react-router"
import { z } from "zod"
import { SubsubsectionForm } from "@/src/components/abschnitte/SubsubsectionForm"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { parseUniqueConstraintError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { getDate } from "@/src/components/project-records/utils/splitStartAt"
import {
  m2mFields,
  m2mFieldRelationNames,
  type M2MFieldsType,
} from "@/src/server/subsubsections/m2mFields"
import {
  deleteSubsubsectionFn,
  updateSubsubsectionFn,
} from "@/src/server/subsubsections/subsubsections.functions"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/types"
import { SubsubsectionFormSchema } from "@/src/shared/subsubsections/schemas"

const subsubsectionEditRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/edit/",
)

type Props = {
  subsubsection: SubsubsectionWithPosition
}

export const EditSubsubsectionForm = ({ subsubsection }: Props) => {
  const navigate = useNavigate()
  const router = useRouter()
  const { projectSlug, subsectionSlug, subsubsectionSlug } = subsubsectionEditRouteApi.useParams()
  const updateSubsubsectionMutation = useMutation({ mutationFn: updateSubsubsectionFn })
  const deleteSubsubsectionMutation = useMutation({ mutationFn: deleteSubsubsectionFn })

  const indexPath = router.buildLocation({
    to: "/$projectSlug/abschnitte/$subsectionSlug",
    params: { projectSlug, subsectionSlug },
  }).href

  const m2mFieldsInitialValues: Record<M2MFieldsType | string, string[]> = {}
  m2mFields.forEach((fieldName) => {
    const relationName = m2mFieldRelationNames[fieldName]
    const relation = subsubsection[relationName as keyof SubsubsectionWithPosition]
    if (relation && typeof relation === "object" && Symbol.iterator in Object(relation)) {
      m2mFieldsInitialValues[fieldName] = Array.from(relation as Iterable<{ id: number }>, (obj) =>
        String(obj.id),
      )
    }
  })

  type HandleSubmit = z.infer<typeof SubsubsectionFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionMutation.mutateAsync({
        data: {
          ...values,
          id: subsubsection.id,
          projectSlug,
          location: values.location === "" ? null : values.location,
          trafficLoadDate: values.trafficLoadDate === "" ? null : new Date(values.trafficLoadDate),
          estimatedCompletionDate:
            values.estimatedCompletionDate === "" ? null : new Date(values.estimatedCompletionDate),
        } as Parameters<typeof updateSubsubsectionMutation.mutateAsync>[0]["data"],
      })
      // The Maßnahme may have been moved to another Planungsabschnitt (admin feature)
      void navigate({
        to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug",
        params: {
          projectSlug,
          subsectionSlug: updated.subsection.slug,
          subsubsectionSlug: updated.slug,
        },
      })
    } catch (error: unknown) {
      const isMove = Number(values.subsectionId) !== subsubsection.subsectionId
      const uniqueConstraint = parseUniqueConstraintError(
        error instanceof Error ? error.message : String(error),
      )
      if (isMove && uniqueConstraint?.fields.includes("subsectionId")) {
        return {
          subsectionId: `Der gewählte Planungsabschnitt enthält bereits eine Maßnahme mit dem Kürzel „${values.slug}“. Bitte wählen Sie einen anderen Planungsabschnitt oder ändern Sie zuerst das Kürzel dieser Maßnahme.`,
        }
      }
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionForm
        className="mt-10"
        submitText="Speichern"
        schema={SubsubsectionFormSchema}
        initialValues={
          {
            ...subsubsection,
            ...m2mFieldsInitialValues,
            location: subsubsection.location || "",
            trafficLoadDate: subsubsection.trafficLoadDate
              ? getDate(subsubsection.trafficLoadDate)
              : "",
            estimatedCompletionDate: subsubsection.estimatedCompletionDate
              ? getDate(subsubsection.estimatedCompletionDate)
              : "",
          } as unknown as z.infer<typeof SubsubsectionFormSchema>
        }
        onSubmit={handleSubmit}
        subsectionSlug={subsectionSlug}
        selectedSubsubsectionSlug={subsubsectionSlug}
        enableSubsectionReassign
        actionBarRight={
          <DeleteActionBar
            itemTitle={shortTitle(subsubsection.slug)}
            onDelete={() =>
              deleteSubsubsectionMutation.mutateAsync({
                data: { projectSlug, id: subsubsection.id },
              })
            }
            returnPath={indexPath}
          />
        }
      />

      <BackLink
        to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
        params={{ projectSlug, subsectionSlug, subsubsectionSlug }}
        text="Zurück zur Maßnahme "
      />
    </>
  )
}
