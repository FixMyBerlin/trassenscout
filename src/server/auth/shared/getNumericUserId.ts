export function getNumericUserId(userId: number | string) {
  const numericUserId = typeof userId === "number" ? userId : Number(userId)
  if (!Number.isInteger(numericUserId)) {
    throw new Error("Invalid authenticated user id.")
  }
  return numericUserId
}
