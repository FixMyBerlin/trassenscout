import db, { Prisma } from "../index"
import { subsubsectionsForLine3, subsubsectionsForPoly3 } from "./subsection_subsubsections"

// lengthM is NOT calculated here but arbitrary values to satisfy the schema

const seedSubsections = async () => {
  // Get projects
  const projects = await db.project.findMany()
  const rs3000Project = projects.find((p) => p.slug === "rs3000")

  // Get operators
  const operators = await db.operator.findMany()
  const rs3000Operator = operators.find((o) => o.slug === "rs3000-operator")

  // Query for the "Trassenverlauf ungeklärt" status
  const trassenverlaufUngeklaertStatus = await db.subsectionStatus.findUnique({
    where: {
      projectId_slug: {
        projectId: 1,
        slug: "trassenverlauf-ungeklaert",
      },
    },
  })

  // Query for the "irrelevant" subsubsection status
  const irrelevantStatus = await db.subsubsectionStatus.findUnique({
    where: {
      projectId_slug: {
        projectId: 1,
        slug: "irrelevant",
      },
    },
  })

  // Helper function to add irrelevant status to one subsubsection of each geometry type
  const addIrrelevantStatus = (
    subsubsections: Omit<Prisma.SubsubsectionUncheckedCreateInput, "subsectionId">[],
  ): Omit<Prisma.SubsubsectionUncheckedCreateInput, "subsectionId">[] => {
    const slugsToMark = ["line-1", "poly-1", "point-1"]
    return subsubsections.map((sub) => {
      if (slugsToMark.includes(sub.slug) && irrelevantStatus?.id) {
        return { ...sub, subsubsectionStatusId: irrelevantStatus.id }
      }
      return sub
    })
  }

  // Create subsubsection for RS3000 (LINE type)
  const rs3000Subsubsection: Omit<Prisma.SubsubsectionUncheckedCreateInput, "subsectionId"> = {
    slug: "rs3000-line-1",
    subTitle: "RS3000 Line Subsubsection",
    type: "LINE",
    geometry: {
      type: "LineString",
      coordinates: [
        [13.35, 52.51],
        [13.352, 52.511],
        [13.354, 52.512],
      ],
    },
    labelPos: "top",
    lengthM: 500,
    width: 3,
    costEstimate: null,
    qualityLevelId: null,
    description: "RS3000 subsubsection with single LineString geometry",
    mapillaryKey: null,
    managerId: null,
    maxSpeed: null,
    trafficLoad: null,
    trafficLoadDate: null,
    planningCosts: null,
    deliveryCosts: null,
    constructionCosts: null,
    landAcquisitionCosts: null,
    expensesOfficialOrders: null,
    expensesTechnicalVerification: null,
    nonEligibleExpenses: null,
    revenuesEconomicIncome: null,
    contributionsThirdParties: null,
    grantsOtherFunding: null,
    ownFunds: null,
  }

  const seedData: Prisma.SubsectionUncheckedCreateInput[] = [
    // Subsection with 1 polygon
    {
      projectId: 1,
      operatorId: 1,
      slug: "poly-1",
      order: 1,
      type: "POLYGON",
      start: "Test Start",
      end: "Test End",
      description: "Test subsection with single Polygon geometry",
      labelPos: "top",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [13.31, 52.51],
            [13.315, 52.51],
            [13.315, 52.515],
            [13.31, 52.515],
            [13.31, 52.51],
          ],
        ],
      },
      lengthM: null,
      managerId: null,
    },
    // Subsection with 3 polygons (MultiPolygon) - has nested subsubsections
    // Two polygons connect at two points, one polygon is separate
    {
      projectId: 1,
      operatorId: 1,
      slug: "poly-3",
      order: 2,
      type: "POLYGON",
      start: "Test Start",
      end: "Test End",
      description:
        "Test subsection with MultiPolygon geometry (3 polygons: 2 connected, 1 separate)",
      labelPos: "bottom",
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          // First polygon of connected pair
          [
            [
              [13.32, 52.51], // Shared point 1
              [13.322, 52.51],
              [13.322, 52.512],
              [13.32, 52.512], // Shared point 2
              [13.32, 52.51],
            ],
          ],
          // Second polygon of connected pair (shares two points)
          [
            [
              [13.32, 52.51], // Shared point 1
              [13.32, 52.512], // Shared point 2
              [13.318, 52.512],
              [13.318, 52.51],
              [13.32, 52.51],
            ],
          ],
          // Separate polygon
          [
            [
              [13.326, 52.514],
              [13.328, 52.514],
              [13.328, 52.516],
              [13.326, 52.516],
              [13.326, 52.514],
            ],
          ],
        ],
      },
      lengthM: null,
      managerId: null,
      subsectionStatusId: trassenverlaufUngeklaertStatus?.id ?? null,
      subsubsections: { create: addIrrelevantStatus(subsubsectionsForPoly3) },
    },
    // Subsection with 1 line
    {
      projectId: 1,
      operatorId: 1,
      slug: "line-1",
      order: 3,
      type: "LINE",
      start: "Test Start",
      end: "Test End",
      description: "Test subsection with single LineString geometry",
      labelPos: "top",
      geometry: {
        type: "LineString",
        coordinates: [
          [13.33, 52.51],
          [13.332, 52.511],
          [13.334, 52.512],
          [13.336, 52.513],
        ],
      },
      lengthM: 1000,
      managerId: null,
    },
    // Subsection with 3 lines (MultiLineString) - has nested subsubsections
    // Two lines connect at one end, one line is separate
    {
      projectId: 1,
      operatorId: 1,
      slug: "line-3",
      order: 4,
      type: "LINE",
      start: "Test Start",
      end: "Test End",
      description:
        "Test subsection with MultiLineString geometry (3 lines: 2 connected, 1 separate)",
      labelPos: "bottom",
      geometry: {
        type: "MultiLineString",
        coordinates: [
          // First line of connected pair
          [
            [13.34, 52.51],
            [13.342, 52.511], // Shared endpoint
          ],
          // Second line of connected pair (shares endpoint)
          [
            [13.342, 52.511], // Shared endpoint
            [13.344, 52.512],
          ],
          // Separate line
          [
            [13.346, 52.512],
            [13.348, 52.513],
          ],
        ],
      },
      lengthM: 3000,
      managerId: null,
      subsectionStatusId: trassenverlaufUngeklaertStatus?.id ?? null,
      subsubsections: { create: addIrrelevantStatus(subsubsectionsForLine3) },
    },
  ]

  // Add RS3000 subsection with one LINE subsubsection
  if (rs3000Project) {
    seedData.push({
      projectId: rs3000Project.id,
      operatorId: rs3000Operator?.id ?? null,
      slug: "rs3000-line",
      order: 1,
      type: "LINE",
      start: "RS3000 Start",
      end: "RS3000 End",
      description: "RS3000 subsection with single LineString geometry",
      labelPos: "top",
      geometry: {
        type: "LineString",
        coordinates: [
          [13.35, 52.51],
          [13.352, 52.511],
          [13.354, 52.512],
        ],
      },
      lengthM: 500,
      managerId: null,
      subsubsections: { create: [rs3000Subsubsection] },
    })
  }

  for (const data of seedData) {
    await db.subsection.create({ data })
  }
}

export default seedSubsections
