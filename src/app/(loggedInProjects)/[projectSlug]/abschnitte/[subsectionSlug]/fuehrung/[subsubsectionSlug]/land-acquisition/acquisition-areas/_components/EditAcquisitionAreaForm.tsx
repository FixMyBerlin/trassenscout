"use client"

import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { subsubsectionLandAcquisitionRoute } from "@/src/core/routes/subsectionRoutes"
import deleteAcquisitionArea from "@/src/server/acquisitionAreas/mutations/deleteAcquisitionArea"
import updateAcquisitionArea from "@/src/server/acquisitionAreas/mutations/updateAcquisitionArea"
import getAcquisitionArea from "@/src/server/acquisitionAreas/queries/getAcquisitionArea"
import { SupportedGeometrySchema } from "@/src/server/shared/utils/geometrySchemas"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { AcquisitionAreaForm, AcquisitionAreaFormSchema } from "./AcquisitionAreaForm"

type Props = {
  acquisitionArea: PromiseReturnType<typeof getAcquisitionArea>
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
  const router = useRouter()
  const [updateAcquisitionAreaMutation] = useMutation(updateAcquisitionArea)
  const [deleteAcquisitionAreaMutation] = useMutation(deleteAcquisitionArea)

  const returnPath = `${subsubsectionLandAcquisitionRoute(
    projectSlug,
    subsectionSlug,
    subsubsectionSlug,
  )}?acquisitionAreaId=${acquisitionArea.id}` as Route
  const indexPath = subsubsectionLandAcquisitionRoute(
    projectSlug,
    subsectionSlug,
    subsubsectionSlug,
  )
  const parcelGeometry = AcquisitionAreaFormSchema.shape.geometry.parse(
    acquisitionArea.parcel.geometry,
  )
  const subsubsectionGeometry = SupportedGeometrySchema.parse(
    acquisitionArea.subsubsection.geometry,
  )

  type HandleSubmit = z.infer<typeof AcquisitionAreaFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateAcquisitionAreaMutation({
        id: acquisitionArea.id,
        projectSlug,
        subsubsectionId: acquisitionArea.subsubsectionId,
        parcelId: acquisitionArea.parcelId,
        geometry: values.geometry,
        description: values.description || null,
        bufferRadiusM: values.bufferRadiusM,
        acquisitionAreaStatusId: values.acquisitionAreaStatusId,
      })
      router.push(returnPath)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <>
      <AcquisitionAreaForm
        className="mt-10"
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
          } as any
        }
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={`Dealfläche ${acquisitionArea.id}`}
            onDelete={() => deleteAcquisitionAreaMutation({ id: acquisitionArea.id, projectSlug })}
            returnPath={indexPath}
          />
        }
      />

      <BackLink href={returnPath} text="Zurück zum Grunderwerb" />
    </>
  )
}
