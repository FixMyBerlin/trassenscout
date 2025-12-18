export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined) {
    return "—"
  }

  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  const formatter = new Intl.NumberFormat("de-DE", {
    style: "decimal",
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
    minimumFractionDigits: 0,
  })
  return formatter.format(size) + " " + units[unitIndex]
}
