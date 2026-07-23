import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useSubsubsectionSpecialMutations } from "@/src/components/subsubsection-special/useSubsubsectionSpecialActions"
import { SubsubsectionSpecial } from "@/src/shared/subsubsectionSpecial/schemas"
import { SubsubsectionSpecialForm } from "./SubsubsectionSpecialForm"

type Props = {
  subsubsectionSpecial: z.infer<typeof SubsubsectionSpecial> & { id: number }
  projectSlug: string
}

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-special/$subsubsectionSpecialId/edit/",
)

export const EditSubsubsectionSpecialForm = ({ subsubsectionSpecial, projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { updateRow, deleteRow, listLink, listHref } = useSubsubsectionSpecialMutations(
    projectSlug,
    search,
  )

  type HandleSubmit = z.infer<ReturnType<typeof SubsubsectionSpecial.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateRow(subsubsectionSpecial.id, values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionSpecialForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionSpecial.omit({ projectId: true })}
        initialValues={subsubsectionSpecial}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={subsubsectionSpecial.title ?? subsubsectionSpecial.slug}
            onDelete={() => deleteRow(subsubsectionSpecial.id)}
            returnPath={listHref}
          />
        }
        backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      />
      <SuperAdminLogData data={{ subsubsectionSpecial }} />
    </>
  )
}
