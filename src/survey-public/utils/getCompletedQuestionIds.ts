export const getCompletedQuestionIds = (values: Record<string, any>) => {
  return Object.entries(values)
    .map(([k, v]) => v && Number(k.split("-")[1]))
    .filter(Boolean)
}
