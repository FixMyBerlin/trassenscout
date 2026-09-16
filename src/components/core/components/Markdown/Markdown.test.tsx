// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

vi.mock("../links/Link", () => ({
  Link: ({ to, className, children }: { to: string; className?: string; children: unknown }) => (
    <a href={to} className={className}>
      {children as never}
    </a>
  ),
}))

const { Markdown } = await import("./Markdown")

describe("Markdown links", () => {
  test("keeps a labelled link inline in the sentence", async () => {
    render(<Markdown markdown="Maßnahme wurde aus [Eingabe 3868](/ohv/x) erstellt." />)

    const link = await screen.findByRole("link", { name: "Eingabe 3868" })
    // `block` would push the link onto its own line, splitting the sentence in three.
    expect(link.className).not.toContain("block")
  })

  test("still truncates a bare URL onto its own line", async () => {
    render(<Markdown markdown="Siehe https://example.org/a/very/long/path/that/keeps/going" />)

    const link = await screen.findByRole("link")
    expect(link.className).toContain("block")
    expect(link.className).toContain("truncate")
  })
})
