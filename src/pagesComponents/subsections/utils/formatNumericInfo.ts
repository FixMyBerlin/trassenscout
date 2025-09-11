export const formatGerM = (n: number) => {
  if (n === 0) {
    return "0 m"
  }

  return n.toFixed(2).replace(".", ",") + " m"
}
export const formatGerPercentage = (n: number) => {
  if (n === 0) {
    return "0 %"
  }
  if (n >= 100) {
    return "100 %"
  }
  return n.toFixed(1).replace(".", ",") + " %"
}
export const formatGerCurrency = (n: number) => {
  if (n === 0) {
    return "0 €"
  }

  return n.toLocaleString("de-DE") + " €"
}
