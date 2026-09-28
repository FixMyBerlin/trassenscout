import { describe, expect, it } from "vitest"
import {
  calculateGrantAmount,
  calculateOwnFunds,
  deviatesFromCalculated,
  expectedOwnFunds,
  hasEnteredValue,
  sumCostStructure,
} from "@/src/shared/subsubsections/costAndFundingFields"

describe("sumCostStructure", () => {
  it("returns null when no cost fields are set", () => {
    expect(sumCostStructure({})).toBeNull()
  })

  it("sums entered cost fields and ignores empty ones", () => {
    expect(
      sumCostStructure({
        planningCosts: 100,
        constructionCosts: "50.5",
        deliveryCosts: null,
        nonEligibleExpenses: "",
      }),
    ).toBe(150.5)
  })
})

describe("calculateGrantAmount", () => {
  it("returns null without a cost structure", () => {
    expect(calculateGrantAmount({})).toBeNull()
    expect(calculateGrantAmount({ grantsOtherFunding: 10 })).toBeNull()
  })

  it("is half of the cost sum when no deductions are entered", () => {
    expect(calculateGrantAmount({ planningCosts: 200, constructionCosts: 100 })).toBe(150)
  })

  it("subtracts every deduction and treats empty ones as 0", () => {
    expect(
      calculateGrantAmount({
        planningCosts: 1000,
        nonEligibleExpenses: 100,
        grantsOtherFunding: "",
        revenuesEconomicIncome: 50,
        contributionsThirdParties: null,
      }),
    ).toBe(475)
  })

  it("caps a negative eligible base at 0", () => {
    expect(
      calculateGrantAmount({
        planningCosts: 100,
        nonEligibleExpenses: 80,
        grantsOtherFunding: 150,
      }),
    ).toBe(0)
  })

  it("rounds to cents", () => {
    expect(calculateGrantAmount({ planningCosts: 10.01 })).toBe(5.01)
  })
})

describe("calculateOwnFunds", () => {
  it("is the cost sum minus the grant, rounded to cents", () => {
    expect(calculateOwnFunds(150.5, 75.25)).toBe(75.25)
    expect(calculateOwnFunds(10.115, 0.01)).toBe(10.11)
  })
})

describe("expectedOwnFunds", () => {
  it("returns null without costs and treats an empty grant as 0", () => {
    expect(expectedOwnFunds({})).toBeNull()
    expect(expectedOwnFunds({ planningCosts: 200 })).toBe(200)
    expect(expectedOwnFunds({ planningCosts: 200, grantAmount: 80 })).toBe(120)
  })
})

describe("deviatesFromCalculated", () => {
  it("ignores empty fields and a missing calculation", () => {
    expect(deviatesFromCalculated("", 10)).toBe(false)
    expect(deviatesFromCalculated(null, 10)).toBe(false)
    expect(deviatesFromCalculated(10, null)).toBe(false)
  })

  it("tolerates less than one cent", () => {
    expect(deviatesFromCalculated(10.004, 10)).toBe(false)
    expect(deviatesFromCalculated("12.35", 12.34)).toBe(true)
  })
})

describe("hasEnteredValue", () => {
  it("treats 0 as entered and empty string as not", () => {
    expect(hasEnteredValue(0)).toBe(true)
    expect(hasEnteredValue("")).toBe(false)
    expect(hasEnteredValue(null)).toBe(false)
  })
})
