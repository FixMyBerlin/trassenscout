"use client"

import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { subsubsectionLandAcquisitionRoute } from "@/src/core/routes/subsectionRoutes"
import deleteDealArea from "@/src/server/dealAreas/mutations/deleteDealArea"
import updateDealArea from "@/src/server/dealAreas/mutations/updateDealArea"
import getDealArea from "@/src/server/dealAreas/queries/getDealArea"
import { SupportedGeometrySchema } from "@/src/server/shared/utils/geometrySchemas"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { DealAreaForm, DealAreaFormSchema } from "./DealAreaForm"

type Props = {
  dealArea: PromiseReturnType<typeof getDealArea>
  projectSlug: string
  subsectionSlug: string
  subsubsectionSlug: string
}

export const EditDealAreaForm = ({
  dealArea,
  projectSlug,
  subsectionSlug,
  subsubsectionSlug,
}: Props) => {
  const router = useRouter()
  const [updateDealAreaMutation] = useMutation(updateDealArea)
  const [deleteDealAreaMutation] = useMutation(deleteDealArea)

  const returnPath = `${subsubsectionLandAcquisitionRoute(
    projectSlug,
    subsectionSlug,
    subsubsectionSlug,
  )}?dealAreaId=${dealArea.id}` as Route
  const indexPath = subsubsectionLandAcquisitionRoute(
    projectSlug,
    subsectionSlug,
    subsubsectionSlug,
  )
  const parcelGeometry = DealAreaFormSchema.shape.geometry.parse(dealArea.parcel.geometry)
  const subsubsectionGeometry = SupportedGeometrySchema.parse(dealArea.subsubsection.geometry)

  type HandleSubmit = z.infer<typeof DealAreaFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateDealAreaMutation({
        id: dealArea.id,
        projectSlug,
        subsubsectionId: dealArea.subsubsectionId,
        parcelId: dealArea.parcelId,
        geometry: values.geometry,
        description: values.description || null,
        dealAreaStatusId: values.dealAreaStatusId,
      })
      router.push(returnPath)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <>
      <DealAreaForm
        className="mt-10"
        submitText="Speichern"
        schema={DealAreaFormSchema}
        parcelGeometry={parcelGeometry}
        subsubsectionGeometry={subsubsectionGeometry}
        initialValues={
          {
            description: dealArea.description ?? "",
            dealAreaStatusId: dealArea.dealAreaStatusId ?? "",
            geometry: dealArea.geometry,
            type: "POLYGON",
          } as any
        }
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={`Dealfläche ${dealArea.id}`}
            onDelete={() => deleteDealAreaMutation({ id: dealArea.id, projectSlug })}
            returnPath={indexPath}
          />
        }
      />

      <BackLink href={returnPath} text="Zurück zum Grunderwerb" />
    </>
  )
}
