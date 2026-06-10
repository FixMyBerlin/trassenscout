import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { useAcquisitionAreaStatusMutations } from "@/src/components/acquisition-area-status/useAcquisitionAreaStatusActions"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
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
  const search = routeApi.useSearch()
  const { createRow } = useAcquisitionAreaStatusMutations(projectSlug, search)

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
      className="mt-10"
      submitText="Erstellen"
      schema={AcquisitionAreaStatusFormSchema}
      onSubmit={handleSubmit}
    />
  )
}
