export const multilinestringToLinestring = (multi: Array<Array<[number, number]>>) => {
  let linestring = multi[0]
  if (multi.length < 2) {
    return linestring
  }
  for (let i = 1; i < multi.length; i++) {
    {
      if (
        // @ts-expect-error
        multi[i][0][0] === multi[i - 1][multi[i - 1].length - 1][0] &&
        // @ts-expect-error
        multi[i][0][1] === multi[i - 1][multi[i - 1].length - 1][1]
      ) {
        linestring?.pop()
        // @ts-expect-error
        linestring = linestring?.concat(multi[i])
      }
    }
    return linestring
  }
}
