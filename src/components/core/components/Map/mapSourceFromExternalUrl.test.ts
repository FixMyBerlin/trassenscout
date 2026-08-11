import { describe, expect, test } from "vitest"
import { MapSourceType } from "./mapDataTypes"
import { mapSourceFromExternalUrl } from "./mapSourceFromExternalUrl"

describe("mapSourceFromExternalUrl", () => {
  test("uses config sourceId as MapLibre id and geojson externalUrl as data", () => {
    const projectExport = "/api/projects/rs23.json"
    expect(
      mapSourceFromExternalUrl("planungsabschnitte", projectExport, MapSourceType.geojson),
    ).toEqual({
      id: "planungsabschnitte",
      type: "geojson",
      data: projectExport,
    })

    const tilda = "https://tilda-geo.de/api/uploads/ohv-haltestellen.geojson"
    expect(mapSourceFromExternalUrl("haltestellen", tilda, MapSourceType.geojson)).toEqual({
      id: "haltestellen",
      type: "geojson",
      data: tilda,
    })
  })

  test("wraps pmtiles externalUrl with pmtiles protocol and uses config sourceId", () => {
    const url = "https://tilda-geo.de/api/uploads/bb-ramboll-netzentwurf-2-beteiligung.pmtiles"
    expect(mapSourceFromExternalUrl("netzentwurf", url, MapSourceType.pmtiles)).toEqual({
      id: "netzentwurf",
      type: "vector",
      url: `pmtiles://${url}`,
    })
  })
})
