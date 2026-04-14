import db from "@/db"
import { TAcquisitionAreaSchema } from "@/src/server/acquisitionAreas/schema"

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
      type: { in: ["LINE", "POLYGON"] },
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
