import { expect, test } from "@/tests/_fixtures/test"
import { getTestDb } from "@/tests/_utils/testDb"

test.describe("Project export API", () => {
  test.describe.configure({ mode: "serial" })

  let projectSlug: string
  let disabledProjectSlug: string
  const createdProjectIds: number[] = []
  const createdSubsectionIds: number[] = []

  test.beforeAll(async () => {
    const db = await getTestDb()
    const stamp = Date.now()
    projectSlug = `e2e-export-${stamp}`
    disabledProjectSlug = `e2e-export-disabled-${stamp}`

    const project = await db.project.create({
      data: {
        slug: projectSlug,
        subTitle: "E2E Export API",
        exportEnabled: true,
      },
      select: { id: true },
    })
    createdProjectIds.push(project.id)

    const lineSubsection = await db.subsection.create({
      data: {
        projectId: project.id,
        slug: "s1",
        type: "LINE",
        geometry: {
          type: "LineString",
          coordinates: [
            [13.4, 52.5],
            [13.41, 52.51],
          ],
        },
      },
      select: { id: true },
    })
    createdSubsectionIds.push(lineSubsection.id)

    // MultiLineString subsection: exported as one LineString feature per part.
    const multiLineSubsection = await db.subsection.create({
      data: {
        projectId: project.id,
        slug: "s3-multi-line",
        type: "LINE",
        geometry: {
          type: "MultiLineString",
          coordinates: [
            [
              [13.42, 52.5],
              [13.43, 52.51],
            ],
            [
              [13.44, 52.52],
              [13.45, 52.53],
            ],
          ],
        },
      },
      select: { id: true },
    })
    createdSubsectionIds.push(multiLineSubsection.id)

    // Polygon subsection: included in the export alongside LineString subsections.
    const polygonSubsection = await db.subsection.create({
      data: {
        projectId: project.id,
        slug: "s2-polygon",
        type: "POLYGON",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [13.4, 52.5],
              [13.41, 52.5],
              [13.41, 52.51],
              [13.4, 52.51],
              [13.4, 52.5],
            ],
          ],
        },
      },
      select: { id: true },
    })
    createdSubsectionIds.push(polygonSubsection.id)

    const disabledProject = await db.project.create({
      data: {
        slug: disabledProjectSlug,
        subTitle: "E2E Export API (disabled)",
        exportEnabled: false,
      },
      select: { id: true },
    })
    createdProjectIds.push(disabledProject.id)
  })

  test.afterAll(async () => {
    const db = await getTestDb()

    for (const id of createdSubsectionIds) {
      await db.subsection.delete({ where: { id } }).catch(() => {})
    }

    for (const id of createdProjectIds) {
      await db.project.delete({ where: { id } }).catch(() => {})
    }
  })

  test("serves GeoJSON for .json export URLs", async ({ request }) => {
    const response = await request.get(`/api/projects/${projectSlug}.json`)

    expect(response.status()).toBe(200)
    expect(response.headers()["content-type"]).toContain("application/json")

    const payload = (await response.json()) as {
      type: string
      features: Array<{
        geometry: { type: string; coordinates: number[][] | number[][][] }
        properties: {
          subsectionSlug: string
          projectSlug: string
          operator?: string | null
          estimatedCompletionDateString?: string | null
          status?: string | null
        }
      }>
    }

    expect(payload.type).toBe("FeatureCollection")
    // LineString (1) + MultiLineString parts (2) + Polygon (1)
    expect(payload.features).toHaveLength(4)

    const lineFeature = payload.features.find(
      (feature) =>
        feature.geometry.type === "LineString" && feature.properties.subsectionSlug === "s1",
    )
    const multiLineFeatures = payload.features.filter(
      (feature) =>
        feature.geometry.type === "LineString" &&
        feature.properties.subsectionSlug === "s3-multi-line",
    )
    const polygonFeature = payload.features.find((feature) => feature.geometry.type === "Polygon")

    expect(lineFeature?.properties.projectSlug).toBe(projectSlug)
    expect(multiLineFeatures).toHaveLength(2)
    expect(
      multiLineFeatures.every((feature) => feature.properties.projectSlug === projectSlug),
    ).toBe(true)
    expect(polygonFeature?.properties.subsectionSlug).toBe("s2-polygon")
    expect(polygonFeature?.properties.projectSlug).toBe(projectSlug)
  })

  test("returns 404 when the project does not exist", async ({ request }) => {
    const response = await request.get(`/api/projects/e2e-export-missing-${Date.now()}.json`)

    expect(response.status()).toBe(404)
    const payload = (await response.json()) as { error: string }
    expect(payload.error).toBe("No project found for that slug")
  })

  test("returns 404 when the export is disabled", async ({ request }) => {
    const response = await request.get(`/api/projects/${disabledProjectSlug}.json`)

    expect(response.status()).toBe(404)
    const payload = (await response.json()) as { error: string }
    expect(payload.error).toBe("The export for this project is disabled by the admin")
  })
})
