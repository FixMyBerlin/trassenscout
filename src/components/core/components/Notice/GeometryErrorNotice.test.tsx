// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { GeometryErrorNotice } from "./GeometryErrorNotice"

const labels = { labelSingular: "Planungsabschnitt", labelPlural: "Planungsabschnitte" }

describe("GeometryErrorNotice", () => {
  test("renders nothing when every geometry is fine", () => {
    const { container } = render(<GeometryErrorNotice items={[]} {...labels} />)

    expect(container).toBeEmptyDOMElement()
  })

  test("names a single affected entry inline", () => {
    render(<GeometryErrorNotice items={[{ id: 1, slug: "poly-1" }]} {...labels} />)

    expect(screen.getByText("Fehlerhafte Geodaten")).toBeDefined()
    expect(screen.getByText("POLY-1")).toBeDefined()
    expect(screen.getByText(/wird auf der Karte nicht angezeigt/)).toBeDefined()
  })

  test("lists several affected entries", () => {
    render(
      <GeometryErrorNotice
        items={[
          { id: 1, slug: "poly-1" },
          { id: 2, slug: "poly-2" },
        ]}
        {...labels}
      />,
    )

    expect(screen.getByText(/Folgende Planungsabschnitte werden/)).toBeDefined()
    expect(screen.getByText("POLY-1")).toBeDefined()
    expect(screen.getByText("POLY-2")).toBeDefined()
  })

  test("can be dismissed", () => {
    const { container } = render(
      <GeometryErrorNotice items={[{ id: 1, slug: "poly-1" }]} {...labels} />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Hinweis schließen" }))

    expect(container).toBeEmptyDOMElement()
  })

  test("uses the label it is given", () => {
    render(
      <GeometryErrorNotice
        items={[{ id: 1, slug: "mn-1" }]}
        labelSingular="Maßnahme"
        labelPlural="Maßnahmen"
      />,
    )

    expect(screen.getByText(/Maßnahme/)).toBeDefined()
  })
})
