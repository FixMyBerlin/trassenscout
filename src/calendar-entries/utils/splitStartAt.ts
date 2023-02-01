export const getDate = (date: Date) => {
  return date.toISOString().split("T").at(0) as string
}
export const getTime = (date: Date) => {
  return date.toISOString().split("T").at(1)?.slice(0, 5) as string
}
