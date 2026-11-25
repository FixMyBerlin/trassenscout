// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"
import { TildaInfraLayerToggle } from "./TildaInfraLayerToggle"

describe("TildaInfraLayerToggle", () => {
  afterEach(cleanup)

  test("switches the layer on and off", () => {
    render(<TildaInfraLayerToggle />)
    const checkbox = screen.getByRole("checkbox", { name: "Radinfrastruktur" })

    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })
})
