import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { useOperatorMutations } from "@/src/components/operators/useOperatorActions"
import { OperatorSchema } from "@/src/shared/operators/schemas"
import { OperatorForm } from "./OperatorForm"

type Props = {
  operator: z.infer<typeof OperatorSchema> & { id: number }
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/operators/$operatorId/edit/")

export const EditOperatorForm = ({ operator, projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { updateRow, deleteRow, listLink, listHref } = useOperatorMutations(projectSlug, search)

  type HandleSubmit = z.infer<ReturnType<typeof OperatorSchema.omit<{ projectId: true }>>>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateRow(operator.id, values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <OperatorForm
        className="grow"
        submitText="Speichern"
        schema={OperatorSchema.omit({ projectId: true })}
        initialValues={operator}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={operator.title ?? operator.slug}
            onDelete={() => deleteRow(operator.id)}
            returnPath={listHref}
          />
        }
      />
      <BackLink {...listLink} text="Zurück zur Übersicht" />
      <SuperAdminLogData data={{ operator }} />
    </>
  )
}
