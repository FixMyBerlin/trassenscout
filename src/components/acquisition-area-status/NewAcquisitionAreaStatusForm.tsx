import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import {
  useAcquisitionAreaStatusMutations,
  useAcquisitionAreaStatusRouteLinks,
} from "@/src/components/acquisition-area-status/useAcquisitionAreaStatusActions"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { preserveFromSearch } from "@/src/shared/routing/preserveListSearch"
import {
  AcquisitionAreaStatusForm,
  AcquisitionAreaStatusFormSchema,
} from "./AcquisitionAreaStatusForm"
import { type AcquisitionAreaStatusStyle } from "./acquisitionAreaStatusStyles"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/acquisition-area-status/new/")

export const NewAcquisitionAreaStatusForm = ({ projectSlug }: Props) => {
  const search = preserveFromSearch(routeApi.useSearch())
  const { createRow } = useAcquisitionAreaStatusMutations(projectSlug, search)
  const { listLink } = useAcquisitionAreaStatusRouteLinks(projectSlug, search)

  type HandleSubmit = z.infer<typeof AcquisitionAreaStatusFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createRow({ ...values, style: Number(values.style) as AcquisitionAreaStatusStyle })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <AcquisitionAreaStatusForm
      submitText="Erstellen"
      backLink={<BackLink {...listLink} text="Zurück zu den Status" />}
      schema={AcquisitionAreaStatusFormSchema}
      onSubmit={handleSubmit}
    />
  )
}
