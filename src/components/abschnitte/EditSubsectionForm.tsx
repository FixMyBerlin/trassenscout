import { useMutation } from "@tanstack/react-query"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { z } from "zod"
import { SubsectionForm } from "@/src/components/abschnitte/SubsectionForm"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { shortTitle } from "@/src/components/core/components/text/titles"
import {
  deleteSubsectionFn,
  updateSubsectionFn,
} from "@/src/server/subsections/subsections.functions"
import type { SubsectionBySlug } from "@/src/server/subsections/types"
import { SubsectionSchema } from "@/src/shared/subsections/schemas"

type Props = {
  subsection: SubsectionBySlug
  projectSlug: string
}

export const EditSubsectionForm = ({ subsection, projectSlug }: Props) => {
  const navigate = useNavigate()
  const router = useRouter()
  const updateSubsectionMutation = useMutation({ mutationFn: updateSubsectionFn })
  const deleteSubsectionMutation = useMutation({ mutationFn: deleteSubsectionFn })

  const indexPath = router.buildLocation({
    to: "/$projectSlug",
    params: { projectSlug },
  }).href

  type HandleSubmit = z.infer<typeof SubsectionSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsectionMutation.mutateAsync({
        data: { ...values, id: subsection.id, projectSlug },
      })
      void navigate({
        to: "/$projectSlug/abschnitte/$subsectionSlug",
        params: { projectSlug, subsectionSlug: updated.slug },
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  return (
    <>
      <SubsectionForm
        submitText="Speichern"
        schema={SubsectionSchema}
        initialValues={subsection}
        subsectionSlug={subsection.slug}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={shortTitle(subsection.slug)}
            onDelete={() =>
              deleteSubsectionMutation.mutateAsync({ data: { projectSlug, id: subsection.id } })
            }
            returnPath={indexPath}
          />
        }
      />

      <BackLink
        to="/$projectSlug/abschnitte/$subsectionSlug"
        params={{ projectSlug, subsectionSlug: subsection.slug }}
        text="Zurück zum Planungsabschnitt"
      />
    </>
  )
}
