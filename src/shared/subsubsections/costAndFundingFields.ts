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

/** Anteil der zuwendungsfähigen Ausgaben, der als Zuwendung angesetzt wird. */
export const GRANT_RATE = 0.5

const grantDeductionFieldNames = [
  "nonEligibleExpenses",
  "grantsOtherFunding",
  "revenuesEconomicIncome",
  "contributionsThirdParties",
] as const

type GrantDeductionFieldName = (typeof grantDeductionFieldNames)[number]

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

function round2(value: number) {
  return Math.round(value * 100) / 100
}

/**
 * Zuwendung = max(0, Summe Kostenstruktur − Abzüge) × GRANT_RATE.
 * Returns null when no cost structure is entered. Empty deductions count as 0.
 */
export function calculateGrantAmount(
  values: Partial<Record<CostStructureFieldName | GrantDeductionFieldName, unknown>>,
): number | null {
  const sum = sumCostStructure(values)
  if (sum === null) return null
  const deductions = grantDeductionFieldNames.reduce(
    (total, name) => total + (enteredCost(values[name]) ?? 0),
    0,
  )
  return round2(Math.max(0, sum - deductions) * GRANT_RATE)
}

/** Eigenmittel = Summe Kostenstruktur − Zuwendung. */
export function calculateOwnFunds(sum: number, grant: number) {
  return round2(sum - grant)
}

/** Summe − eingetragene Zuwendung. Null without a cost structure; an empty grant counts as 0. */
export function expectedOwnFunds(
  values: { grantAmount?: unknown } & Partial<Record<CostStructureFieldName, unknown>>,
) {
  const sum = sumCostStructure(values)
  if (sum === null) return null
  return calculateOwnFunds(sum, enteredCost(values.grantAmount) ?? 0)
}

/** True when an entered amount differs from the calculated value by at least one cent. */
export function deviatesFromCalculated(entered: unknown, calculated: number | null) {
  if (calculated === null) return false
  const value = enteredCost(entered)
  if (value === null) return false
  return Math.round(value * 100) !== Math.round(calculated * 100)
}

export function hasEnteredValue(raw: unknown): boolean {
  if (raw === null || raw === undefined) return false
  if (typeof raw === "string") return raw.trim() !== ""
  if (typeof raw === "number") return Number.isFinite(raw)
  if (typeof raw === "boolean") return raw
  if (raw instanceof Date) return !Number.isNaN(raw.getTime())
  return true
}
