import db from "@/db"
import {
  ALKIS_LAND_ACQUISITION_DEMO_ENTRIES,
  alkisLandAcquisitionDemoProjects,
  buildAlkisLandAcquisitionDemoSubsection,
} from "@/db/seeds/alkisLandAcquisitionDemos"
import { assertAlkisDemoMutationAllowed } from "@/src/server/admin/utils/alkisDemoMutationEnvGate"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const SeedAlkisLandAcquisitionDemosSchema = z.object({})

export type SeedAlkisLandAcquisitionDemosResult = {
  entries: Array<{
    slug: string
    project: "created" | "updated"
    subsection: "created" | "skipped"
  }>
}

export default resolver.pipe(
  resolver.zod(SeedAlkisLandAcquisitionDemosSchema),
  resolver.authorize("ADMIN"),
  async () => {
    assertAlkisDemoMutationAllowed()

    const demoProjects = alkisLandAcquisitionDemoProjects()
    const entries: SeedAlkisLandAcquisitionDemosResult["entries"] = []

    for (const def of ALKIS_LAND_ACQUISITION_DEMO_ENTRIES) {
      const projectPayload = demoProjects.find((p) => p.slug === def.slug)
      if (!projectPayload) {
        throw new Error(`Interner Fehler: Demo-Projekt-Daten fehlen für ${def.slug}`)
      }

      const existingProject = await db.project.findUnique({
        where: { slug: def.slug },
        select: { id: true },
      })

      const project = await db.project.upsert({
        where: { slug: def.slug },
        create: projectPayload,
        update: {
          subTitle: projectPayload.subTitle,
          description: projectPayload.description,
          alkisStateKey: projectPayload.alkisStateKey,
          landAcquisitionModuleEnabled: true,
        },
      })

      const existingSubsection = await db.subsection.findUnique({
        where: {
          projectId_slug: { projectId: project.id, slug: "alkis-demo" },
        },
        select: { id: true },
      })

      let subsectionStatus: "created" | "skipped"
      if (!existingSubsection) {
        await db.subsection.create({
          data: buildAlkisLandAcquisitionDemoSubsection(project.id, def.center),
        })
        subsectionStatus = "created"
      } else {
        subsectionStatus = "skipped"
      }

      entries.push({
        slug: def.slug,
        project: existingProject ? "updated" : "created",
        subsection: subsectionStatus,
      })
    }

    return { entries } satisfies SeedAlkisLandAcquisitionDemosResult
  },
)
