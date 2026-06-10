import db from "@/src/server/db.server"
import { TAcquisitionAreaSchema } from "@/src/shared/acquisitionAreas/schemas"

type ValidateAcquisitionAreaInput = Pick<
  TAcquisitionAreaSchema,
  "subsubsectionId" | "parcelId" | "acquisitionAreaStatusId"
> & {
  projectSlug: string
}

export const validateAcquisitionAreaInput = async ({
  projectSlug,
  subsubsectionId,
  parcelId,
  acquisitionAreaStatusId,
}: ValidateAcquisitionAreaInput) => {
  await db.subsubsection.findFirstOrThrow({
    where: {
      id: subsubsectionId,
      subsection: {
        project: {
          slug: projectSlug,
        },
      },
    },
    select: { id: true },
  })

  await db.parcel.findFirstOrThrow({
    where: { id: parcelId },
    select: { id: true },
  })

  if (acquisitionAreaStatusId) {
    await db.acquisitionAreaStatus.findFirstOrThrow({
      where: {
        id: acquisitionAreaStatusId,
        project: {
          slug: projectSlug,
        },
      },
      select: { id: true },
    })
  }
}
