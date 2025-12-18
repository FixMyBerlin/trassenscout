export function truncateErrorText(text: string, maxLength = 200): string {
  let cleanText = text.replace(/<[^>]*>/g, "").trim()
  cleanText = cleanText.replace(/\s+/g, " ")
  if (cleanText.length <= maxLength) return cleanText
  return cleanText.substring(0, maxLength) + "..."
}
