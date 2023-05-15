export const formattedLength = (length?: number | null) => {
  if (!length) {
    return "k.A."
  }

  return length.toLocaleString() + " km"
}

export const formattedWidth = (width?: number | null) => {
  if (!width) {
    return "k.A."
  }

  return width.toLocaleString() + " m"
}

export const formattedEuro = (euro?: number | null) => {
  if (!euro) {
    return "k.A."
  }

  return euro.toLocaleString() + " €"
}
