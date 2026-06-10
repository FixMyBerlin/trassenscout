export const getDate = (date: Date) => {
  return date.toISOString().split("T").at(0) as string
}
