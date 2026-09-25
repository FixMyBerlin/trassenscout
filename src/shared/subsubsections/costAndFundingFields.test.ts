import { describe, expect, it } from "vitest"
import {
  calculateOwnFunds,
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

describe("calculateOwnFunds", () => {
  it("returns null when neither costs nor grant are set", () => {
    expect(calculateOwnFunds({})).toBeNull()
  })

  it("treats empty grant as 0 when costs exist", () => {
    expect(calculateOwnFunds({ planningCosts: 200 })).toBe(200)
  })

  it("subtracts grant from cost sum", () => {
    expect(
      calculateOwnFunds({
        planningCosts: 100,
        constructionCosts: 50,
        grantAmount: 30,
      }),
    ).toBe(120)
  })

  it("rounds to cents", () => {
    expect(
      calculateOwnFunds({
        planningCosts: 10.115,
        grantAmount: 0.01,
      }),
    ).toBe(10.11)
  })
})

describe("hasEnteredValue", () => {
  it("treats 0 as entered and empty string as not", () => {
    expect(hasEnteredValue(0)).toBe(true)
    expect(hasEnteredValue("")).toBe(false)
    expect(hasEnteredValue(null)).toBe(false)
  })
})
