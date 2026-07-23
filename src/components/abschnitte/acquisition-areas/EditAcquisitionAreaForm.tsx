import { useMutation } from "@tanstack/react-query"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { z } from "zod"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  deleteAcquisitionAreaFn,
  updateAcquisitionAreaFn,
} from "@/src/server/acquisitionAreas/acquisitionAreas.functions"
import type { AcquisitionAreaDetail } from "@/src/server/acquisitionAreas/types"
import { SupportedGeometrySchema } from "@/src/shared/geometry/geometrySchemas"
import { AcquisitionAreaForm, AcquisitionAreaFormSchema } from "./AcquisitionAreaForm"

type Props = {
  acquisitionArea: AcquisitionAreaDetail
  projectSlug: string
  subsectionSlug: string
  subsubsectionSlug: string
}

export const EditAcquisitionAreaForm = ({
  acquisitionArea,
  projectSlug,
  subsectionSlug,
  subsubsectionSlug,
}: Props) => {
  const navigate = useNavigate()
  const router = useRouter()
  const updateAcquisitionAreaMutation = useMutation({ mutationFn: updateAcquisitionAreaFn })
  const deleteAcquisitionAreaMutation = useMutation({ mutationFn: deleteAcquisitionAreaFn })

  const landAcquisitionParams = { projectSlug, subsectionSlug, subsubsectionSlug }
  const landAcquisitionLink = {
    to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition" as const,
    params: landAcquisitionParams,
  }
  const indexPath = router.buildLocation(landAcquisitionLink).href
  const parcelGeometry = AcquisitionAreaFormSchema.shape.geometry.parse(
    acquisitionArea.parcel.geometry,
  )
  const subsubsectionGeometry = SupportedGeometrySchema.parse(
    acquisitionArea.subsubsection.geometry,
  )

  type HandleSubmit = z.infer<typeof AcquisitionAreaFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateAcquisitionAreaMutation.mutateAsync({
        data: {
          id: acquisitionArea.id,
          projectSlug,
          subsubsectionId: acquisitionArea.subsubsectionId,
          parcelId: acquisitionArea.parcelId,
          geometry: values.geometry,
          description: values.description || null,
          bufferRadiusM: values.bufferRadiusM,
          acquisitionAreaStatusId: values.acquisitionAreaStatusId,
        },
      })
      void navigate({
        ...landAcquisitionLink,
        search: { acquisitionAreaId: String(acquisitionArea.id) },
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <>
      <AcquisitionAreaForm
        submitText="Speichern"
        schema={AcquisitionAreaFormSchema}
        parcelGeometry={parcelGeometry}
        subsubsectionGeometry={subsubsectionGeometry}
        initialValues={
          {
            description: acquisitionArea.description ?? "",
            bufferRadiusM: acquisitionArea.bufferRadiusM ?? "",
            acquisitionAreaStatusId: acquisitionArea.acquisitionAreaStatusId ?? "",
            geometry: acquisitionArea.geometry,
            type: "POLYGON",
          } as z.infer<typeof AcquisitionAreaFormSchema>
        }
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={`Verhandlungsfläche ${acquisitionArea.id}`}
            onDelete={() =>
              deleteAcquisitionAreaMutation.mutateAsync({
                data: { id: acquisitionArea.id, projectSlug },
              })
            }
            returnPath={indexPath}
          />
        }
        backLink={
          <BackLink
            to={landAcquisitionLink.to}
            params={landAcquisitionLink.params}
            search={{ acquisitionAreaId: String(acquisitionArea.id) }}
            text="Zurück zum Grunderwerb"
          />
        }
      />
    </>
  )
}
