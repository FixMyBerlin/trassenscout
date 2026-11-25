import { describe, expect, test } from "vitest"
import { getNextTildaInfraHover } from "./tildaInfraHover"

const leftLane = {
  id: "way/1/cycleway/left",
  properties: {
    id: "way/1/cycleway/left",
    category: "cyclewayOnHighway_exclusive",
    width: 2,
    surface: "asphalt",
  },
}
const rightLane = {
  id: "way/1/cycleway/right",
  properties: {
    id: "way/1/cycleway/right",
    category: "cyclewayOnHighway_advisory",
    width: 1.25,
    surface: "asphalt",
  },
}
const rightLaneLikeLeft = {
  id: "way/1/cycleway/right",
  properties: { ...leftLane.properties, id: "way/1/cycleway/right" },
}
const otherLane = {
  id: "way/2",
  properties: { id: "way/2", category: "bicycleRoad", surface: "sett" },
}

describe("getNextTildaInfraHover", () => {
  test("shows the hovered line at the cursor", () => {
    expect(getNextTildaInfraHover(null, [leftLane], { lng: 13.4, lat: 52.5 })).toEqual({
      featureIds: "way/1/cycleway/left",
      longitude: 13.4,
      latitude: 52.5,
      entries: [{ category: "Radfahrstreifen", width: "2 m", surface: "Asphalt" }],
    })
  })

  test("shows both sides of a street", () => {
    expect(
      getNextTildaInfraHover(null, [rightLane, leftLane], { lng: 13.4, lat: 52.5 })?.entries,
    ).toEqual([
      { category: "Schutzstreifen", width: "1,25 m", surface: "Asphalt" },
      { category: "Radfahrstreifen", width: "2 m", surface: "Asphalt" },
    ])
  })

  test("shows identical sides once", () => {
    expect(
      getNextTildaInfraHover(null, [leftLane, rightLaneLikeLeft], { lng: 13.4, lat: 52.5 })
        ?.entries,
    ).toEqual([{ category: "Radfahrstreifen", width: "2 m", surface: "Asphalt" }])
  })

  test("keeps the card where it is while the cursor moves along the same lines", () => {
    const first = getNextTildaInfraHover(null, [leftLane, rightLane], { lng: 13.4, lat: 52.5 })
    expect(getNextTildaInfraHover(first, [rightLane, leftLane], { lng: 13.41, lat: 52.51 })).toBe(
      first,
    )
  })

  test("moves the card to another line", () => {
    const first = getNextTildaInfraHover(null, [leftLane], { lng: 13.4, lat: 52.5 })
    expect(getNextTildaInfraHover(first, [otherLane], { lng: 13.41, lat: 52.51 })).toMatchObject({
      featureIds: "way/2",
      longitude: 13.41,
      latitude: 52.51,
      entries: [{ category: "Fahrradstraße" }],
    })
  })

  test("clears the card when no TILDA line is hovered", () => {
    const first = getNextTildaInfraHover(null, [leftLane], { lng: 13.4, lat: 52.5 })
    expect(getNextTildaInfraHover(first, [], { lng: 13.41, lat: 52.51 })).toBeNull()
  })
})
