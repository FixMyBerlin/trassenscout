import db from "@/db"
import { TDealAreaSchema } from "@/src/server/dealAreas/schema"

type ValidateDealAreaInput = Pick<
  TDealAreaSchema,
  "subsubsectionId" | "parcelId" | "dealAreaStatusId"
> & {
  projectSlug: string
}

export const validateDealAreaInput = async ({
  projectSlug,
  subsubsectionId,
  parcelId,
  dealAreaStatusId,
}: ValidateDealAreaInput) => {
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

  if (dealAreaStatusId) {
    await db.dealAreaStatus.findFirstOrThrow({
      where: {
        id: dealAreaStatusId,
        project: {
          slug: projectSlug,
        },
      },
      select: { id: true },
    })
  }
}
