// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"
import { useTildaInfraLayerActions, useTildaInfraLayerVisible } from "./tilda-infra-layer-store"
import { TildaInfraLayerToggle } from "./TildaInfraLayerToggle"
import { TildaInfraLegend } from "./TildaInfraLegend"

vi.mock("react-map-gl/maplibre", () => ({
  useMap: () => ({
    mainMap: {
      getCenter: () => ({ lat: 52.520008, lng: 13.404954 }),
      getZoom: () => 14.256,
    },
  }),
}))

const switchLayerOn = () =>
  fireEvent.click(screen.getByRole("checkbox", { name: "Radinfrastruktur" }))

describe("TildaInfraLegend", () => {
  afterEach(() => {
    const { result } = renderHook(() => ({
      visible: useTildaInfraLayerVisible(),
      actions: useTildaInfraLayerActions(),
    }))
    if (result.current.visible) act(() => result.current.actions.toggle())
    cleanup()
    vi.restoreAllMocks()
  })

  test("shows nothing while the layer is off", () => {
    render(<TildaInfraLegend mapId="mainMap" />)
    expect(screen.queryByText("Radinfrastruktur")).toBeNull()
  })

  test("opens TILDA at the map's current view", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null)
    render(
      <>
        <TildaInfraLayerToggle />
        <TildaInfraLegend mapId="mainMap" />
      </>,
    )
    switchLayerOn()
    fireEvent.click(screen.getByRole("button", { name: "In TILDA ansehen" }))

    expect(open).toHaveBeenCalledWith(
      "https://tilda-geo.de/regionen/radinfra?map=14.3/52.52/13.405",
      "_blank",
      "noopener",
    )
  })

  test("shows the legend entry without a link when there is no map to read", () => {
    render(
      <>
        <TildaInfraLayerToggle />
        <TildaInfraLegend />
      </>,
    )
    switchLayerOn()

    expect(screen.getAllByText("Radinfrastruktur")).toHaveLength(2)
    expect(screen.queryByRole("button", { name: "In TILDA ansehen" })).toBeNull()
  })

  test("gives screen readers the explanation, not only the question", () => {
    render(
      <>
        <TildaInfraLayerToggle />
        <TildaInfraLegend mapId="mainMap" />
      </>,
    )
    switchLayerOn()

    expect(
      screen.getByRole("button", { name: /bestehende Radinfrastruktur aus OpenStreetMap/ }),
    ).toBeInTheDocument()
  })
})
