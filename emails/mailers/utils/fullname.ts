export const fullanme = (firstname: string | undefined, lastname: string | undefined) => {
  return [firstname, lastname].filter(Boolean).join(" ")
}
