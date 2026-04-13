import { ALKIS_LAND_ACQUISITION_DEMO_PROJECT_SLUGS } from "@/db/seeds/alkisLandAcquisitionDemos"
import db from "@/db"
import { assertAlkisDemoMutationAllowed } from "@/src/server/admin/utils/alkisDemoMutationEnvGate"
import { deleteAlkisLandAcquisitionDemoProject } from "@/src/server/admin/utils/deleteAlkisLandAcquisitionDemoProject"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const DeleteAlkisLandAcquisitionDemosSchema = z.object({})

export type DeleteAlkisLandAcquisitionDemosResult = {
  results: Array<{ slug: string; status: "deleted" | "not_found" }>
}

export default resolver.pipe(
  resolver.zod(DeleteAlkisLandAcquisitionDemosSchema),
  resolver.authorize("ADMIN"),
  async () => {
    assertAlkisDemoMutationAllowed()

    const results: DeleteAlkisLandAcquisitionDemosResult["results"] = []

    for (const slug of ALKIS_LAND_ACQUISITION_DEMO_PROJECT_SLUGS) {
      const project = await db.project.findUnique({
        where: { slug },
        select: { id: true },
      })
      if (!project) {
        results.push({ slug, status: "not_found" })
        continue
      }
      await db.$transaction(async (tx) => {
        await deleteAlkisLandAcquisitionDemoProject(tx, project.id)
      })
      results.push({ slug, status: "deleted" })
    }

    return { results }
  },
)
