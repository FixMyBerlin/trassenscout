import {
  ALKIS_LAND_ACQUISITION_DEMO_ENTRIES,
  ALKIS_LAND_ACQUISITION_DEMO_PROJECT_SLUGS,
  alkisLandAcquisitionDemoProjects,
  buildAlkisLandAcquisitionDemoSubsection,
} from "@/prisma/seeds/alkisLandAcquisitionDemos"
import { assertAlkisDemoMutationAllowed } from "@/src/server/admin/utils/alkisDemoMutationEnvGate"
import { deleteAlkisLandAcquisitionDemoProject } from "@/src/server/admin/utils/deleteAlkisLandAcquisitionDemoProject"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"

type SeedAlkisLandAcquisitionDemosResult = {
  entries: Array<{
    slug: string
    project: "created" | "updated"
    subsection: "created" | "skipped"
  }>
}

type DeleteAlkisLandAcquisitionDemosResult = {
  results: Array<{ slug: string; status: "deleted" | "not_found" }>
}

export async function seedAlkisLandAcquisitionDemos(headers: Headers) {
  await endpointAuth.admin(headers)
  assertAlkisDemoMutationAllowed()

  const demoProjects = alkisLandAcquisitionDemoProjects()
  const entries: SeedAlkisLandAcquisitionDemosResult["entries"] = []

  for (const def of ALKIS_LAND_ACQUISITION_DEMO_ENTRIES) {
    const projectPayload = demoProjects.find((project) => project.slug === def.slug)
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
}

export async function deleteAlkisLandAcquisitionDemos(headers: Headers) {
  await endpointAuth.admin(headers)
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
}
