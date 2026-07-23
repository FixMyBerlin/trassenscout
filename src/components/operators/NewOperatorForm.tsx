import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  useOperatorMutations,
  useOperatorRouteLinks,
} from "@/src/components/operators/useOperatorActions"
import { operatorMaxOrderQueryOptions } from "@/src/server/operators/operatorMaxOrderQueryOptions"
import { OperatorSchema } from "@/src/shared/operators/schemas"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"
import { OperatorForm } from "./OperatorForm"

const CreateOperatorSchema = OperatorSchema.omit({ projectId: true })

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/operators/new/")

export const NewOperatorForm = ({ projectSlug }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { createRow } = useOperatorMutations(projectSlug, search)
  const { listLink } = useOperatorRouteLinks(projectSlug, search)
  const { data: maxOrder } = useSuspenseQuery(operatorMaxOrderQueryOptions(projectSlug))

  type HandleSubmit = z.infer<typeof CreateOperatorSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createRow(values)
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <OperatorForm
      submitText="Erstellen"
      backLink={<BackLink {...listLink} text="Zurück zur Übersicht" />}
      schema={CreateOperatorSchema}
      onSubmit={handleSubmit}
      initialValues={{ order: (maxOrder ?? 0) + 1 }}
    />
  )
}
