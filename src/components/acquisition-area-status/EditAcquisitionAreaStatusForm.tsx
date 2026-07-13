import { getRouteApi } from "@tanstack/react-router"
import { z } from "zod"
import { useAcquisitionAreaStatusMutations } from "@/src/components/acquisition-area-status/useAcquisitionAreaStatusActions"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  AcquisitionAreaStatusForm,
  AcquisitionAreaStatusFormSchema,
} from "./AcquisitionAreaStatusForm"
import {
  type AcquisitionAreaStatusStyle,
  type AcquisitionAreaStatusStyleValue,
} from "./acquisitionAreaStatusStyles"

type AcquisitionAreaStatusRow = {
  id: number
  projectId: number
  slug: string
  title: string
  style: AcquisitionAreaStatusStyle
}

type Props = {
  acquisitionAreaStatus: AcquisitionAreaStatusRow
  projectSlug: string
}

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/acquisition-area-status/$acquisitionAreaStatusId/edit/",
)

export const EditAcquisitionAreaStatusForm = ({ acquisitionAreaStatus, projectSlug }: Props) => {
  const search = routeApi.useSearch()
  const { updateRow, deleteRow, listLink, listHref } = useAcquisitionAreaStatusMutations(
    projectSlug,
    search,
  )

  type HandleSubmit = z.infer<typeof AcquisitionAreaStatusFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateRow(acquisitionAreaStatus.id, {
        ...values,
        style: Number(values.style) as AcquisitionAreaStatusStyle,
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <AcquisitionAreaStatusForm
        className="grow"
        submitText="Speichern"
        schema={AcquisitionAreaStatusFormSchema}
        initialValues={{
          slug: acquisitionAreaStatus.slug,
          title: acquisitionAreaStatus.title,
          style: String(acquisitionAreaStatus.style) as AcquisitionAreaStatusStyleValue,
        }}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={acquisitionAreaStatus.title}
            onDelete={() => deleteRow(acquisitionAreaStatus.id)}
            returnPath={listHref}
          />
        }
      />
      <BackLink {...listLink} text="Zurück zu den Status" />
      <SuperAdminLogData data={{ acquisitionAreaStatus }} />
    </>
  )
}
