export const multilinestringToLinestring = (multi: Array<Array<[number, number]>>) => {
  if (multi.length === 0) {
    return []
  }

  if (multi.length === 1) {
    return multi[0]
  }

  const firstSegment = multi[0]
  if (!firstSegment) {
    return []
  }

  let linestring = [...firstSegment]

  for (const segment of multi.slice(1)) {
    const lastPoint = linestring[linestring.length - 1]
    const firstPoint = segment[0]

    if (
      lastPoint &&
      firstPoint &&
      lastPoint[0] === firstPoint[0] &&
      lastPoint[1] === firstPoint[1]
    ) {
      linestring.pop()
    }

    linestring = linestring.concat(segment)
  }

  return linestring
}
