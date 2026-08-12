import type { Position } from "geojson"
import { describe, expect, it } from "vitest"
import { mergeContiguousLines } from "./mergeContiguousLines"

const TOLERANCE = 0.0003

describe("mergeContiguousLines", () => {
  it("joins lines that share an endpoint into one continuous line", () => {
    const a: Position[] = [
      [0, 0],
      [1, 1],
    ]
    const b: Position[] = [
      [1, 1],
      [2, 2],
    ]

    expect(mergeContiguousLines([a, b], TOLERANCE)).toEqual([
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
    ])
  })

  it("joins regardless of direction and input order", () => {
    // b is reversed and comes first; the shared point is [1,1].
    const b: Position[] = [
      [2, 2],
      [1, 1],
    ]
    const a: Position[] = [
      [0, 0],
      [1, 1],
    ]

    const merged = mergeContiguousLines([b, a], TOLERANCE)

    expect(merged).toHaveLength(1)
    expect(merged[0]).toHaveLength(3)
    // Endpoints are the two free ends, whichever way round it was assembled.
    const ends = [merged[0]!.at(0), merged[0]!.at(-1)]
    expect(ends).toEqual(expect.arrayContaining([[0, 0]]))
    expect(ends).toEqual(expect.arrayContaining([[2, 2]]))
  })

  it("chains many segments into a single line", () => {
    const segments: Position[][] = Array.from({ length: 8 }, (_, i) => [
      [i, 0],
      [i + 1, 0],
    ])

    const merged = mergeContiguousLines(segments, TOLERANCE)

    expect(merged).toHaveLength(1)
    expect(merged[0]).toHaveLength(9)
  })

  it("keeps disconnected lines as separate parts", () => {
    const a: Position[] = [
      [0, 0],
      [1, 0],
    ]
    const far: Position[] = [
      [50, 50],
      [51, 50],
    ]

    expect(mergeContiguousLines([a, far], TOLERANCE)).toHaveLength(2)
  })

  it("treats endpoints within the tolerance as the same point", () => {
    const a: Position[] = [
      [0, 0],
      [1, 1],
    ]
    // Off by less than the tolerance — real subsections rarely share exact coordinates.
    const nearlyTouching: Position[] = [
      [1 + TOLERANCE / 2, 1],
      [2, 2],
    ]

    expect(mergeContiguousLines([a, nearlyTouching], TOLERANCE)).toHaveLength(1)
  })

  it("does not join endpoints beyond the tolerance", () => {
    const a: Position[] = [
      [0, 0],
      [1, 1],
    ]
    const tooFar: Position[] = [
      [1 + TOLERANCE * 2, 1],
      [2, 2],
    ]

    expect(mergeContiguousLines([a, tooFar], TOLERANCE)).toHaveLength(2)
  })

  it("drops degenerate lines and handles the empty case", () => {
    expect(mergeContiguousLines([], TOLERANCE)).toEqual([])
    expect(mergeContiguousLines([[[0, 0]]], TOLERANCE)).toEqual([])
  })

  it("does not mutate its input", () => {
    const a: Position[] = [
      [0, 0],
      [1, 1],
    ]
    const b: Position[] = [
      [1, 1],
      [2, 2],
    ]

    mergeContiguousLines([a, b], TOLERANCE)

    expect(a).toEqual([
      [0, 0],
      [1, 1],
    ])
    expect(b).toEqual([
      [1, 1],
      [2, 2],
    ])
  })
})
