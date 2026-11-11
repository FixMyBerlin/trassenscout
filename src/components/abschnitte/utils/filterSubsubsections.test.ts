import { describe, expect, test } from "vitest"
import {
  collapsedSubsectionSlugs,
  filterSubsections,
  filterSubsubsections,
  hiddenMatchSnippet,
  projectSearchResults,
  searchMatchSummary,
  subsectionMatchSummary,
  subsubsectionMatchSummary,
} from "./filterSubsubsections"

const subsubsections = [
  {
    id: 1,
    slug: "rf-1",
    subTitle: null,
    description: "Neue Querung am Marktplatz",
    SubsubsectionTask: { title: "Radweg" },
  },
  {
    id: 2,
    slug: "2024-017",
    subTitle: "Ortsdurchfahrt Süd",
    description: null,
    SubsubsectionTask: null,
  },
  {
    id: 3,
    slug: "sf-3",
    subTitle: null,
    description: null,
    SubsubsectionTask: { title: "Fahrradstraße" },
  },
]

function filteredIds(searchterm: string) {
  return filterSubsubsections(subsubsections, searchterm).map(({ id }) => id)
}

describe("filterSubsubsections", () => {
  test("returns everything without a searchterm", () => {
    expect(filteredIds("")).toEqual([1, 2, 3])
    expect(filteredIds("   ")).toEqual([1, 2, 3])
  })

  test("finds the Kürzel, also as it is displayed in upper case", () => {
    expect(filteredIds("2024-017")).toEqual([2])
    expect(filteredIds("RF-1")).toEqual([1])
  })

  test("finds the title, stored as subTitle or as Maßnahmentyp", () => {
    expect(filteredIds("ortsdurchfahrt")).toEqual([2])
    expect(filteredIds("fahrradstraße")).toEqual([3])
  })

  test("finds the description", () => {
    expect(filteredIds("marktplatz")).toEqual([1])
  })

  test("ignores surrounding whitespace and case", () => {
    expect(filteredIds("  RADWEG ")).toEqual([1])
  })

  test("returns nothing when no field matches", () => {
    expect(filteredIds("gibt es nicht")).toEqual([])
  })
})

describe("hiddenMatchSnippet", () => {
  const [withDescription, withSubTitle] = subsubsections as [
    (typeof subsubsections)[number],
    (typeof subsubsections)[number],
  ]

  test("stays empty when a visible column already shows the match", () => {
    expect(hiddenMatchSnippet(withSubTitle, "süd")).toBeNull()
    expect(hiddenMatchSnippet(withDescription, "rf-1")).toBeNull()
  })

  test("stays empty without a searchterm or a match", () => {
    expect(hiddenMatchSnippet(withDescription, "")).toBeNull()
    expect(hiddenMatchSnippet(withDescription, "gibt es nicht")).toBeNull()
  })

  test("quotes the description", () => {
    expect(hiddenMatchSnippet(withDescription, "marktplatz")).toEqual({
      label: "Beschreibung",
      text: "Neue Querung am Marktplatz",
    })
  })

  test("quotes the Maßnahmentyp", () => {
    expect(hiddenMatchSnippet(withDescription, "radweg")).toEqual({
      label: "Maßnahmentyp",
      text: "Radweg",
    })
  })

  test("cuts long descriptions around the match and flattens line breaks", () => {
    const snippet = hiddenMatchSnippet(
      {
        ...withDescription,
        description: `${"Vorher ".repeat(20)}Wichtiger\nMarktplatz ${"danach ".repeat(20)}`,
      },
      "marktplatz",
    )

    expect(snippet?.text).toMatch(/^….*Wichtiger Marktplatz.*…$/)
    expect(snippet?.text.length).toBeLessThan(110)
  })
})

describe("collapsedSubsectionSlugs", () => {
  const matchesIn = (matchCountBySlug: Record<string, number>) =>
    Object.entries(matchCountBySlug).flatMap(([slug, matchCount]) =>
      Array.from({ length: matchCount }, () => ({ subsection: { slug } })),
    )

  test("starts all groups open up to 100 matches", () => {
    expect(collapsedSubsectionSlugs(matchesIn({ a: 95, b: 5 }), new Map()).size).toBe(0)
  })

  test("starts all groups closed above 100 matches, small ones included", () => {
    expect([...collapsedSubsectionSlugs(matchesIn({ a: 100, b: 1 }), new Map())]).toEqual([
      "a",
      "b",
    ])
  })

  test("keeps the only group open, however big it is", () => {
    expect(collapsedSubsectionSlugs(matchesIn({ only: 150 }), new Map()).size).toBe(0)
  })

  test("lets the user change single groups from either start", () => {
    const manyMatches = matchesIn({ a: 60, b: 60 })
    const fewMatches = matchesIn({ a: 2, b: 2 })

    expect([...collapsedSubsectionSlugs(manyMatches, new Map([["a", false]]))]).toEqual(["b"])
    expect([...collapsedSubsectionSlugs(fewMatches, new Map([["a", true]]))]).toEqual(["a"])
  })
})

describe("subsubsectionMatchSummary", () => {
  test("uses singular and plural", () => {
    expect(subsubsectionMatchSummary(1, 1)).toBe("1 Maßnahme in 1 Planungsabschnitt")
    expect(subsubsectionMatchSummary(18, 10)).toBe("18 Maßnahmen in 10 Planungsabschnitten")
  })
})

describe("subsectionMatchSummary", () => {
  test("uses singular and plural", () => {
    expect(subsectionMatchSummary(1)).toBe("1 Planungsabschnitt")
    expect(subsectionMatchSummary(3)).toBe("3 Planungsabschnitte")
  })
})

const projectSubsections = [
  { id: 10, slug: "birkenwerder" },
  { id: 11, slug: "hohen-neuendorf" },
  { id: 12, slug: "gransee" },
]

const projectSubsubsections = [
  { slug: "b1", subsectionId: 10, description: "Radweg in Birkenwerder" },
  { slug: "h1", subsectionId: 11, description: "Anschluss Richtung Birkenwerder" },
  { slug: "g1", subsectionId: 12, description: "Ortsmitte" },
].map((subsubsection) => ({
  ...subsubsection,
  subTitle: null,
  SubsubsectionTask: null,
  subsection: {
    slug: projectSubsections.find(({ id }) => id === subsubsection.subsectionId)?.slug ?? "",
  },
}))

describe("filterSubsections", () => {
  test("finds the Kürzel, ignoring case, # and surrounding whitespace", () => {
    expect(filterSubsections(projectSubsections, " #Gransee ").map(({ slug }) => slug)).toEqual([
      "gransee",
    ])
    expect(filterSubsections(projectSubsections, "neuen").map(({ slug }) => slug)).toEqual([
      "hohen-neuendorf",
    ])
  })

  test("returns everything without a searchterm", () => {
    expect(filterSubsections(projectSubsections, "")).toHaveLength(3)
  })

  test("finds place names typed with umlauts, ß and spaces", () => {
    const placeSubsections = [
      "fuerstenberg",
      "grossbeeren",
      "hohen-neuendorf",
      "loewenberger-land",
      "muehlenbecker-land",
      "oberkraemer",
    ].map((slug) => ({ slug }))
    const found = (searchterm: string) =>
      filterSubsections(placeSubsections, searchterm).map(({ slug }) => slug)

    expect(found("Mühlenbecker Land")).toEqual(["muehlenbecker-land"])
    expect(found("Oberkrämer")).toEqual(["oberkraemer"])
    expect(found("Hohen  Neuendorf")).toEqual(["hohen-neuendorf"])
    expect(found("Löwenberger")).toEqual(["loewenberger-land"])
    expect(found("Fürstenberg")).toEqual(["fuerstenberg"])
    expect(found("Großbeeren")).toEqual(["grossbeeren"])
    expect(found("muehlenbecker")).toEqual(["muehlenbecker-land"])
  })
})

describe("projectSearchResults", () => {
  test("finds a Planungsabschnitt by its Kürzel alone", () => {
    const results = projectSearchResults(projectSubsections, projectSubsubsections, "gransee")

    expect(results.subsectionMatches.map(({ slug }) => slug)).toEqual(["gransee"])
    expect(results.subsubsectionMatches).toEqual([])
    expect([...results.matchedSubsectionSlugs]).toEqual(["gransee"])
    expect(results.slugsWithSubsubsectionMatches.size).toBe(0)
  })

  test("keeps Planungsabschnitt and Maßnahmen matches apart", () => {
    const results = projectSearchResults(projectSubsections, projectSubsubsections, "BIRKENWERDER")

    expect(results.subsectionMatches.map(({ slug }) => slug)).toEqual(["birkenwerder"])
    expect(results.subsubsectionMatches.map(({ slug }) => slug)).toEqual(["b1", "h1"])
    expect([...results.slugsWithSubsubsectionMatches]).toEqual(["birkenwerder", "hohen-neuendorf"])
    expect([...results.matchedSubsectionSlugs]).toEqual(["birkenwerder", "hohen-neuendorf"])
  })

  test("leaves out Maßnahmen of filtered out Planungsabschnitte", () => {
    const results = projectSearchResults(
      projectSubsections.slice(0, 1),
      projectSubsubsections,
      "birkenwerder",
    )

    expect(results.subsubsectionMatches.map(({ slug }) => slug)).toEqual(["b1"])
  })
})

describe("searchMatchSummary", () => {
  const summaryFor = (searchterm: string) =>
    searchMatchSummary(projectSearchResults(projectSubsections, projectSubsubsections, searchterm))

  test("names what matched", () => {
    expect(summaryFor("gransee")).toBe("1 Planungsabschnitt")
    expect(summaryFor("richtung")).toBe("1 Maßnahme in 1 Planungsabschnitt")
    expect(summaryFor("birkenwerder")).toBe("1 Planungsabschnitt und 2 Maßnahmen")
  })
})
