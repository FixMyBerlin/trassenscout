import type { Position } from "geojson"

const isSamePoint = (a: Position, b: Position, toleranceDeg: number) =>
  Math.abs(a[0]! - b[0]!) <= toleranceDeg && Math.abs(a[1]! - b[1]!) <= toleranceDeg

/**
 * Joins line coordinate arrays whose endpoints coincide into as few continuous lines as possible.
 *
 * Why: MapLibre renders every feature (and every part of a MultiLineString) as its own line, with
 * its own caps. A route split across N features therefore has N-1 interior junctions, and at each
 * one a butt cap leaves a wedge on the outer side of a bend while the wider line-outline halo shows
 * through as a dark tick — which reads as a lumpy chain rather than one route when zoomed out.
 * Merging removes the junctions entirely, so cap style stops mattering.
 *
 * Greedy: take a line, keep extending it from either end (in either direction) until nothing else
 * connects, then start the next one. Order-dependent only in which of several equally valid joins
 * happens first, which does not change the rendered result.
 *
 * Runs in O(n²) on the number of lines per project — n is small (subsections), and this is meant to
 * be applied to already-simplified coordinates.
 *
 * Lines that do not connect are returned unchanged, so gaps and branches survive as separate parts.
 */
export function mergeContiguousLines(lines: Position[][], toleranceDeg: number): Position[][] {
  const pool = lines.filter((line) => line.length >= 2).map((line) => [...line])
  const merged: Position[][] = []

  while (pool.length) {
    let current = pool.shift()!
    let extended = true

    while (extended) {
      extended = false

      for (let index = 0; index < pool.length; index++) {
        const candidate = pool[index]!
        const currentStart = current[0]!
        const currentEnd = current.at(-1)!
        const candidateStart = candidate[0]!
        const candidateEnd = candidate.at(-1)!

        // Drop the duplicated shared vertex when concatenating.
        if (isSamePoint(currentEnd, candidateStart, toleranceDeg)) {
          current = current.concat(candidate.slice(1))
        } else if (isSamePoint(currentEnd, candidateEnd, toleranceDeg)) {
          current = current.concat([...candidate].reverse().slice(1))
        } else if (isSamePoint(currentStart, candidateEnd, toleranceDeg)) {
          current = candidate.concat(current.slice(1))
        } else if (isSamePoint(currentStart, candidateStart, toleranceDeg)) {
          current = [...candidate].reverse().concat(current.slice(1))
        } else {
          continue
        }

        pool.splice(index, 1)
        extended = true
        break
      }
    }

    merged.push(current)
  }

  return merged
}
