export const costStructureFieldNames = [
  "planningCosts",
  "constructionCosts",
  "deliveryCosts",
  "landAcquisitionCosts",
  "expensesOfficialOrders",
  "expensesTechnicalVerification",
  "nonEligibleExpenses",
] as const

export const fundingFieldNames = [
  "grantAmount",
  "ownFunds",
  "grantsOtherFunding",
  "revenuesEconomicIncome",
  "contributionsThirdParties",
  "remainingFunding",
  "disbursedFunding",
] as const

export const trafficLoadFieldNames = ["maxSpeed", "trafficLoad", "trafficLoadDate"] as const

export const durationFieldNames = [
  "planningPeriod",
  "constructionPeriod",
  "estimatedCompletionDate",
] as const

type CostStructureFieldName = (typeof costStructureFieldNames)[number]

function enteredCost(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null
  if (typeof raw === "string" && raw.trim() !== "") {
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  }
  return null
}

export function sumCostStructure(
  values: Partial<Record<CostStructureFieldName, unknown>>,
): number | null {
  const entered = costStructureFieldNames.flatMap((name) => {
    const value = enteredCost(values[name])
    return value === null ? [] : [value]
  })
  if (entered.length === 0) return null
  return entered.reduce((sum, value) => sum + value, 0)
}

/** Eigenmittel = Summe Kostenstruktur − Zuwendung. Returns null when neither side has a value. */
export function calculateOwnFunds(
  values: {
    grantAmount?: unknown
  } & Partial<Record<CostStructureFieldName, unknown>>,
): number | null {
  const sum = sumCostStructure(values)
  const grant = enteredCost(values.grantAmount)
  if (sum === null && grant === null) return null
  return Math.round(((sum ?? 0) - (grant ?? 0)) * 100) / 100
}

export function hasEnteredValue(raw: unknown): boolean {
  if (raw === null || raw === undefined) return false
  if (typeof raw === "string") return raw.trim() !== ""
  if (typeof raw === "number") return Number.isFinite(raw)
  if (typeof raw === "boolean") return raw
  if (raw instanceof Date) return !Number.isNaN(raw.getTime())
  return true
}
