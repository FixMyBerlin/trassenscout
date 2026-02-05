import { Prisma } from "@prisma/client"

// lengthM is NOT calculated here but arbitrary values to satisfy the schema

// Base subsubsections for poly-3 and line-3 subsections
// Each subsection gets 6 subsubsections covering all geometry variants

// Subsubsections for poly-3 (MultiPolygon subsection)
// All geometries must be inside the poly-3 bounds:
// Polygon 1: [13.32, 52.51] to [13.322, 52.512]
// Polygon 2: [13.323, 52.512] to [13.325, 52.514]
// Polygon 3: [13.326, 52.514] to [13.328, 52.516]
export const subsubsectionsForPoly3: Omit<
  Prisma.SubsubsectionUncheckedCreateInput,
  "subsectionId"
>[] = [
  // Line 1: Single line (separate, not connected)
  {
    slug: "line-1",
    subTitle: "Subsubsection with 1 LineString (separate)",
    type: "LINE",
    geometry: {
      type: "LineString",
      coordinates: [
        [13.321, 52.511],
        [13.3215, 52.5115],
        [13.3218, 52.5118],
      ],
    },
    labelPos: "top",
    lengthM: 300,
    width: 3,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 1 LineString (separate)",
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
  },
  // Line 2: MultiLineString with 2 connected lines (sharing endpoint) + 1 separate
  // Two lines connect at [13.3235, 52.513], one is separate
  {
    slug: "line-3",
    subTitle: "Subsubsection with 3 LineStrings (2 connected, 1 separate)",
    type: "LINE",
    geometry: {
      type: "MultiLineString",
      coordinates: [
        // First line of connected pair
        [
          [13.3235, 52.513], // Shared endpoint
          [13.324, 52.5135],
        ],
        // Second line of connected pair (shares endpoint)
        [
          [13.3235, 52.513], // Shared endpoint
          [13.3238, 52.5128],
        ],
        // Separate line
        [
          [13.327, 52.515],
          [13.3275, 52.5155],
        ],
      ],
    },
    labelPos: "top",
    lengthM: 600,
    width: 3,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 3 LineStrings (2 connected, 1 separate)",
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
  },
  // Polygon 1: Single polygon (separate area)
  {
    slug: "poly-1",
    subTitle: "Subsubsection with 1 Polygon (separate)",
    type: "POLYGON",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [13.3205, 52.5105],
          [13.3215, 52.5105],
          [13.3215, 52.5115],
          [13.3205, 52.5115],
          [13.3205, 52.5105],
        ],
      ],
    },
    labelPos: "top",
    lengthM: null,
    width: null,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 1 Polygon (separate)",
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
  },
  // Polygon 2: MultiPolygon with 2 connected areas (sharing two points) + 1 separate
  // Two polygons connect at two points, one is separate
  {
    slug: "poly-3",
    subTitle: "Subsubsection with 3 Polygons (2 connected, 1 separate)",
    type: "POLYGON",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        // First polygon of connected pair
        [
          [
            [13.3235, 52.5125], // Shared point 1
            [13.3245, 52.5125],
            [13.3245, 52.5135],
            [13.3235, 52.5135], // Shared point 2
            [13.3235, 52.5125],
          ],
        ],
        // Second polygon of connected pair (shares two points)
        [
          [
            [13.3235, 52.5125], // Shared point 1
            [13.3235, 52.5135], // Shared point 2
            [13.3225, 52.5135],
            [13.3225, 52.5125],
            [13.3235, 52.5125],
          ],
        ],
        // Separate polygon
        [
          [
            [13.3265, 52.5145],
            [13.3275, 52.5145],
            [13.3275, 52.5155],
            [13.3265, 52.5155],
            [13.3265, 52.5145],
          ],
        ],
      ],
    },
    labelPos: "top",
    lengthM: null,
    width: null,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 3 Polygons (2 connected, 1 separate)",
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
  },
  // Point 1: Single point (on a line)
  {
    slug: "point-1",
    subTitle: "Subsubsection with 1 Point (on line)",
    type: "POINT",
    geometry: {
      type: "Point",
      coordinates: [13.3215, 52.5115], // On line-1
    },
    labelPos: "top",
    lengthM: null,
    width: null,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 1 Point (on line)",
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
  },
  // Point 2: MultiPoint with 3 points in areas + 1 point on line + 1 point ~200m from line
  // 200m ≈ 0.00295 degrees at this latitude
  {
    slug: "point-3",
    subTitle: "Subsubsection with 5 Points (3 in areas, 1 on line, 1 offset)",
    type: "POINT",
    geometry: {
      type: "MultiPoint",
      coordinates: [
        // 3 points in areas
        [13.321, 52.511], // In poly-1
        [13.324, 52.513], // In connected polygons
        [13.327, 52.515], // In separate polygon
        // 1 point on line
        [13.3235, 52.513], // On connected lines
        // 1 point ~200m from line (offset by ~0.003 degrees)
        [13.3218, 52.5118 + 0.003], // Offset from line-1
      ],
    },
    labelPos: "top",
    lengthM: null,
    width: null,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 5 Points (3 in areas, 1 on line, 1 offset)",
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
  },
]

// Subsubsections for line-3 (MultiLineString subsection)
// All geometries must be along/inside the line-3 bounds:
// Line 1: [13.34, 52.51] to [13.342, 52.511]
// Line 2: [13.343, 52.511] to [13.345, 52.512]
// Line 3: [13.346, 52.512] to [13.348, 52.513]
export const subsubsectionsForLine3: Omit<
  Prisma.SubsubsectionUncheckedCreateInput,
  "subsectionId"
>[] = [
  // Line 1: Single line (separate, not connected)
  {
    slug: "line-1",
    subTitle: "Subsubsection with 1 LineString (separate)",
    type: "LINE",
    geometry: {
      type: "LineString",
      coordinates: [
        [13.3405, 52.5105],
        [13.341, 52.5108],
        [13.3415, 52.511],
      ],
    },
    labelPos: "top",
    lengthM: 300,
    width: 3,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 1 LineString (separate)",
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
  },
  // Line 2: MultiLineString with 2 connected lines (sharing endpoint) + 1 separate
  // Two lines connect at [13.344, 52.5115], one is separate
  {
    slug: "line-3",
    subTitle: "Subsubsection with 3 LineStrings (2 connected, 1 separate)",
    type: "LINE",
    geometry: {
      type: "MultiLineString",
      coordinates: [
        // First line of connected pair
        [
          [13.344, 52.5115], // Shared endpoint
          [13.3445, 52.5118],
        ],
        // Second line of connected pair (shares endpoint)
        [
          [13.344, 52.5115], // Shared endpoint
          [13.3438, 52.5113],
        ],
        // Separate line
        [
          [13.3465, 52.5125],
          [13.347, 52.5128],
        ],
      ],
    },
    labelPos: "top",
    lengthM: 600,
    width: 3,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 3 LineStrings (2 connected, 1 separate)",
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
  },
  // Polygon 1: Single polygon (to the left of lines)
  {
    slug: "poly-1",
    subTitle: "Subsubsection with 1 Polygon (left of line)",
    type: "POLYGON",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [13.3395, 52.5105], // Left of line
          [13.3405, 52.5105],
          [13.3405, 52.511],
          [13.3395, 52.511],
          [13.3395, 52.5105],
        ],
      ],
    },
    labelPos: "top",
    lengthM: null,
    width: null,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 1 Polygon (left of line)",
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
  },
  // Polygon 2: MultiPolygon with 2 connected areas (sharing two points) + 1 separate
  // Two polygons connect at two points, positioned left/right of lines
  {
    slug: "poly-3",
    subTitle: "Subsubsection with 3 Polygons (2 connected, 1 separate)",
    type: "POLYGON",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        // First polygon of connected pair (left of line)
        [
          [
            [13.3435, 52.5113], // Shared point 1
            [13.3445, 52.5113],
            [13.3445, 52.5118],
            [13.3435, 52.5118], // Shared point 2
            [13.3435, 52.5113],
          ],
        ],
        // Second polygon of connected pair (right of line, shares two points)
        [
          [
            [13.3435, 52.5113], // Shared point 1
            [13.3435, 52.5118], // Shared point 2
            [13.3425, 52.5118],
            [13.3425, 52.5113],
            [13.3435, 52.5113],
          ],
        ],
        // Separate polygon (right of line)
        [
          [
            [13.3468, 52.5125],
            [13.3478, 52.5125],
            [13.3478, 52.513],
            [13.3468, 52.513],
            [13.3468, 52.5125],
          ],
        ],
      ],
    },
    labelPos: "top",
    lengthM: null,
    width: null,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 3 Polygons (2 connected, 1 separate)",
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
  },
  // Point 1: Single point (on a line)
  {
    slug: "point-1",
    subTitle: "Subsubsection with 1 Point (on line)",
    type: "POINT",
    geometry: {
      type: "Point",
      coordinates: [13.341, 52.5108], // On line-1
    },
    labelPos: "top",
    lengthM: null,
    width: null,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 1 Point (on line)",
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
  },
  // Point 2: MultiPoint with 3 points in areas + 1 point on line + 1 point ~200m from line
  // 200m ≈ 0.00295 degrees at this latitude
  {
    slug: "point-3",
    subTitle: "Subsubsection with 5 Points (3 in areas, 1 on line, 1 offset)",
    type: "POINT",
    geometry: {
      type: "MultiPoint",
      coordinates: [
        // 3 points in areas
        [13.34, 52.5107], // In poly-1 (left)
        [13.344, 52.5115], // In connected polygons
        [13.3473, 52.5127], // In separate polygon (right)
        // 1 point on line
        [13.344, 52.5115], // On connected lines
        // 1 point ~200m from line (offset by ~0.003 degrees)
        [13.3415, 52.511 + 0.003], // Offset from line-1
      ],
    },
    labelPos: "top",
    lengthM: null,
    width: null,
    costEstimate: null,
    qualityLevelId: null,
    description: "Test subsubsection: Subsubsection with 5 Points (3 in areas, 1 on line, 1 offset)",
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
  },
]

// Keep the old export for backward compatibility (if needed)
export const subsubsections: Omit<Prisma.SubsubsectionUncheckedCreateInput, "subsectionId">[] = [
  {
    slug: "rf1",
    subTitle: "Radweg mit landw. Verkehr frei",
    type: "LINE",
    geometry: {
      type: "LineString",
      coordinates: [
        [13.363361116374904, 52.519430986022115],
        [13.357157800454104, 52.517204842057566],
      ],
    },
    labelPos: "topLeft",
    lengthM: 487,
    width: 3,
    costEstimate: 10_000,
    qualityLevelId: 1,
    description:
      "Ausweitung des Straßenbegleitenden **Feldweges zum Radweg**.  Bestätigung für landwirtschaftlichen Verkehr.",
    mapillaryKey: "797685018581574",
    managerId: 1,
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
  },
  {
    slug: "rf2",
    subTitle: "Ufersteg Hansaviertel",
    type: "LINE",
    geometry: {
      type: "LineString",
      coordinates: [
        [13.350954484534668, 52.51914062581497],
        [13.345069287379602, 52.52262482165125],
        [13.33966126837197, 52.52233448255228],
      ],
    },
    labelPos: "bottomLeft",
    lengthM: 922,
    width: 3,
    costEstimate: null,
    qualityLevelId: 2,
    description: "Rad- und Fußverkehr wird auf einem Ufersteig zum Teil über dem Wasser geführt.",
    mapillaryKey: "1646379745805677",
    managerId: null,
    maxSpeed: 30,
    trafficLoad: 3456,
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
  },
  {
    slug: "rf3",
    subTitle: "Fahrradstraße Levetzowstraße",
    type: "LINE",
    geometry: {
      type: "LineString",
      coordinates: [
        [13.334253249364252, 52.51701125899095],
        [13.329481467886865, 52.5184631112015],
        [13.327890874060671, 52.523108715884604],
        [13.322641914435906, 52.5248506909908],
      ],
    },
    labelPos: "left",
    lengthM: 1293,
    width: 4,
    costEstimate: 20_000,
    qualityLevelId: null,
    description: "Ausbau Levetzowstraße zur Fahrradstraße mit Modalfilter, Anwohner frei.",
    mapillaryKey: "249624194247195",
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
  },
  {
    slug: "sf1",
    subTitle: "Radweg auf Gotskowskybrücke",
    type: "POINT",
    geometry: {
      type: "Point",
      coordinates: [13.329078172644188, 52.5225862734311],
    },
    labelPos: "top",
    lengthM: 3000,
    width: 2,
    costEstimate: 30_000,
    qualityLevelId: 4,
    description: `
**Sonderführung Radverkehr über Gotskowskybrücke.** Radweg auf einer Seite für beide Fahrtrichtungen. Schutz vor Kfz durch Betonschwellen.

- Foo
- Bar
      `,
    mapillaryKey: "249624194247195",
    managerId: 1,
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
  },
  {
    slug: "sf2",
    subTitle: "Radweg unter S-Bahn-Brücke",
    type: "POINT",
    geometry: {
      type: "Point",
      coordinates: [13.350034203659277, 52.51973770393019],
    },
    labelPos: "top",
    lengthM: 500,
    width: 2,
    costEstimate: 10_000,
    qualityLevelId: null,
    description:
      "Sonderführung Radverkehr unter der S-Bahn-Brücke im Seitenraum. Wegfall von einzelnen Kfz Stellplätzen; Neuaufteilung Parkspur, Radweg und Gehweg.",
    mapillaryKey: null,
    managerId: 3,
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
  },
]
