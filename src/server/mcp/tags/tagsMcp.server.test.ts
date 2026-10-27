import { beforeEach, describe, expect, test, vi } from "vitest"
import { createTagsForMcp, listTagsForMcp, updateTagsForMcp } from "./tagsMcp.server"

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    project: { findUnique: vi.fn() },
    tag: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}))

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))

const project = (id: number, slug: string, mcpMode: "DRAFT" | "DIRECT") => ({
  id,
  slug,
  mcpMode,
  mcpDirectUntil: mcpMode === "DIRECT" ? new Date("2099-01-01") : null,
  subsubsectionExtraFieldDefinitions: [],
})

const projects: Record<string, ReturnType<typeof project>> = {
  "frm9-ra1": project(1, "frm9-ra1", "DIRECT"),
  "frm9-ra2": project(2, "frm9-ra2", "DIRECT"),
  "frm9-ra3": project(3, "frm9-ra3", "DRAFT"),
}

const origin = "http://localhost"

beforeEach(() => {
  vi.clearAllMocks()
  mockDb.project.findUnique.mockImplementation(
    ({ where }: { where: { slug: string } }) => projects[where.slug] ?? null,
  )
  mockDb.tag.findFirst.mockResolvedValue(null)
})

describe("createTagsForMcp", () => {
  test("gives several projects the same tag in one call", async () => {
    const result = await createTagsForMcp({
      items: [
        { projectSlug: "frm9-ra1", title: "Radweg", color: "MINT", description: "Für Radwege" },
        { projectSlug: "frm9-ra2", title: "Radweg", color: "MINT", description: "Für Radwege" },
      ],
      origin,
    })

    expect(mockDb.tag.create.mock.calls.map(([args]) => args.data)).toEqual([
      { projectId: 1, title: "Radweg", color: "MINT", description: "Für Radwege" },
      { projectId: 2, title: "Radweg", color: "MINT", description: "Für Radwege" },
    ])
    expect(result.items.map((item) => [item.projectSlug, item.outcome, item.mode])).toEqual([
      ["frm9-ra1", "created", "applied"],
      ["frm9-ra2", "created", "applied"],
    ])
  })

  test("leaves a tag with the same title in another case unchanged", async () => {
    mockDb.tag.findFirst.mockResolvedValue({ id: 7, title: "radweg", archivedAt: null })

    const result = await createTagsForMcp({
      items: [{ projectSlug: "frm9-ra1", title: "Radweg" }],
      origin,
    })

    expect(result.items[0]).toMatchObject({
      title: "radweg",
      outcome: "unchanged",
      mode: null,
      errors: [],
    })
    expect(mockDb.tag.create).not.toHaveBeenCalled()
    expect(mockDb.tag.update).not.toHaveBeenCalled()
  })

  test("restores an archived tag instead of creating a second one", async () => {
    mockDb.tag.findFirst.mockResolvedValue({ id: 7, title: "Radweg", archivedAt: new Date() })

    const result = await createTagsForMcp({
      items: [{ projectSlug: "frm9-ra1", title: "Radweg" }],
      origin,
    })

    expect(mockDb.tag.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { archivedAt: null },
    })
    expect(result.items[0]).toMatchObject({ outcome: "restored", mode: "applied" })
    expect(mockDb.tag.create).not.toHaveBeenCalled()
  })

  test("writes a title repeated for the same project once", async () => {
    await createTagsForMcp({
      items: [
        { projectSlug: "frm9-ra1", title: "Radweg" },
        { projectSlug: "frm9-ra1", title: " radweg " },
      ],
      origin,
    })

    expect(mockDb.tag.create).toHaveBeenCalledTimes(1)
    expect(mockDb.tag.create.mock.calls[0]?.[0].data.title).toBe("radweg")
  })

  test("refuses projects without direct write and still writes the others", async () => {
    const result = await createTagsForMcp({
      items: [
        { projectSlug: "frm9-ra3", title: "Radweg" },
        { projectSlug: "frm9-ra1", title: "Radweg" },
      ],
      origin,
    })

    expect(result.items[0]?.errors[0]).toMatch(/direct write/)
    expect(result.items[1]?.outcome).toBe("created")
    expect(mockDb.tag.create).toHaveBeenCalledTimes(1)
  })

  test("rejects an empty title", async () => {
    const result = await createTagsForMcp({
      items: [{ projectSlug: "frm9-ra1", title: "  " }],
      origin,
    })

    expect(result.items[0]?.errors).toEqual(["title ist erforderlich"])
    expect(mockDb.tag.create).not.toHaveBeenCalled()
  })
})

describe("updateTagsForMcp", () => {
  const radwege = { id: 7, title: "Radwege", color: "BLUE", description: "Alt" }

  test("renames and recolors the same tag in several projects", async () => {
    mockDb.tag.findFirst.mockImplementation(({ where }: { where: { id?: unknown } }) =>
      where.id ? null : radwege,
    )

    const result = await updateTagsForMcp({
      items: ["frm9-ra1", "frm9-ra2"].map((projectSlug) => ({
        projectSlug,
        title: "radwege",
        patch: { title: "Radweg", color: "MINT" as const },
      })),
      origin,
    })

    expect(mockDb.tag.update).toHaveBeenCalledTimes(2)
    expect(mockDb.tag.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { title: "Radweg", color: "MINT" },
    })
    expect(result.items.map((item) => [item.projectSlug, item.title, item.outcome])).toEqual([
      ["frm9-ra1", "Radweg", "updated"],
      ["frm9-ra2", "Radweg", "updated"],
    ])
  })

  test("allows a rename that only changes the case", async () => {
    mockDb.tag.findFirst.mockImplementation(({ where }: { where: { id?: unknown } }) =>
      where.id ? null : radwege,
    )

    const result = await updateTagsForMcp({
      items: [{ projectSlug: "frm9-ra1", title: "Radwege", patch: { title: "RADWEGE" } }],
      origin,
    })

    expect(result.items[0]?.outcome).toBe("updated")
    expect(mockDb.tag.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { title: "RADWEGE" },
    })
  })

  test("refuses a title that another tag of the project already has", async () => {
    mockDb.tag.findFirst.mockImplementation(({ where }: { where: { id?: unknown } }) =>
      where.id ? { id: 8 } : radwege,
    )

    const result = await updateTagsForMcp({
      items: [{ projectSlug: "frm9-ra1", title: "Radwege", patch: { title: "Radweg" } }],
      origin,
    })

    expect(result.items[0]?.errors).toEqual(["Tag existiert bereits: Radweg"])
    expect(mockDb.tag.update).not.toHaveBeenCalled()
  })

  test("clears the description and leaves equal values alone", async () => {
    mockDb.tag.findFirst.mockResolvedValue(radwege)

    const result = await updateTagsForMcp({
      items: [
        {
          projectSlug: "frm9-ra1",
          title: "Radwege",
          patch: { color: "BLUE", clear: ["description" as const] },
        },
      ],
      origin,
    })

    expect(mockDb.tag.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { description: null },
    })
    expect(result.items[0]?.changes).toEqual([{ field: "description", proposed: null }])
  })

  test("reports unchanged when the patch matches the tag", async () => {
    mockDb.tag.findFirst.mockResolvedValue(radwege)

    const result = await updateTagsForMcp({
      items: [{ projectSlug: "frm9-ra1", title: "Radwege", patch: { color: "BLUE" } }],
      origin,
    })

    expect(result.items[0]).toMatchObject({ outcome: "unchanged", mode: null, errors: [] })
    expect(mockDb.tag.update).not.toHaveBeenCalled()
  })

  test("reports an unknown tag and an empty patch", async () => {
    const result = await updateTagsForMcp({
      items: [{ projectSlug: "frm9-ra1", title: "Gibt es nicht", patch: { color: "RED" } }],
      origin,
    })

    expect(result.items[0]?.errors).toEqual(["Tag nicht gefunden: Gibt es nicht"])
    mockDb.tag.findFirst.mockResolvedValue(radwege)
    const empty = await updateTagsForMcp({
      items: [{ projectSlug: "frm9-ra2", title: "Radwege", patch: {} }],
      origin,
    })
    expect(empty.items[0]?.errors[0]).toMatch(/patch ist leer/)
    expect(mockDb.tag.update).not.toHaveBeenCalled()
  })

  test("is refused without direct write", async () => {
    const result = await updateTagsForMcp({
      items: [{ projectSlug: "frm9-ra3", title: "Radwege", patch: { color: "RED" } }],
      origin,
    })

    expect(result.items[0]?.errors[0]).toMatch(/direct write/)
    expect(mockDb.tag.findFirst).not.toHaveBeenCalled()
  })
})

describe("listTagsForMcp", () => {
  test("lists archived tags too, so they can be compared across projects", async () => {
    mockDb.tag.findMany.mockResolvedValue([
      { title: "Radweg", color: "MINT", description: null, archivedAt: null },
      { title: "Alt", color: "BLUE", description: null, archivedAt: new Date() },
    ])

    const result = await listTagsForMcp({ projectSlug: "frm9-ra3", origin })

    expect(result.items).toEqual([
      {
        projectSlug: "frm9-ra3",
        title: "Radweg",
        color: "MINT",
        description: null,
        archived: false,
        url: "http://localhost/frm9-ra3/tags",
      },
      {
        projectSlug: "frm9-ra3",
        title: "Alt",
        color: "BLUE",
        description: null,
        archived: true,
        url: "http://localhost/frm9-ra3/tags",
      },
    ])
  })
})
