import { describe, expect, test } from "vitest"
import { getTildaInfraUrl } from "./getTildaInfraUrl"

describe("getTildaInfraUrl", () => {
  test.each([
    {
      view: { zoom: 14.256, lat: 52.520008, lng: 13.404954 },
      url: "https://tilda-geo.de/regionen/radinfra?map=14.3/52.52/13.405",
    },
    {
      view: { zoom: 11, lat: 52.123456, lng: 13.987654 },
      url: "https://tilda-geo.de/regionen/radinfra?map=11/52.123/13.988",
    },
    {
      view: { zoom: 17.5, lat: 52.1234567, lng: 13.9876543 },
      url: "https://tilda-geo.de/regionen/radinfra?map=17.5/52.12346/13.98765",
    },
  ])("rounds zoom $view.zoom the way TILDA does", ({ view, url }) => {
    expect(getTildaInfraUrl(view)).toBe(url)
  })
})
