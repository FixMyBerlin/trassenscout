export const formattedLength = (length?: number | null) => {
  if (length === undefined || length === null) {
    return "k.A."
  }

  return length.toLocaleString() + " km"
}

export const formattedWidth = (width?: number | null) => {
  if (width === undefined || width === null) {
    return "k.A."
  }

  return width.toLocaleString() + " m"
}

export const formattedEuro = (euro?: number | null) => {
  if (euro === undefined || euro === null) {
    return "k.A."
  }
  const options = {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }
  return euro.toLocaleString("de-DE", options)
}
