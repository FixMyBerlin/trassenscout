import { describe, expect, it, vi } from "vitest"
import { recalculateFundingOnBasisBlur } from "./SubsubsectionFundingCalculation"

const fakeForm = (values: Record<string, unknown>) => ({
  state: { values },
  setFieldValue: vi.fn((name: string, value: unknown) => {
    values[name] = value
  }) as unknown as (name: never, value: never) => void,
})

const fakeBaseline = (current: { grantAmount: number; ownFunds: number } | null) => ({
  baselineRef: { current },
  setBaseline: vi.fn(),
})

describe("recalculateFundingOnBasisBlur", () => {
  it("fills empty Zuwendung and Eigenmittel when a basis field is left", () => {
    const form = fakeForm({ planningCosts: 10000, contributionsThirdParties: 1000 })
    const baseline = fakeBaseline(null)

    recalculateFundingOnBasisBlur(form, "planningCosts", baseline)

    expect(form.state.values).toMatchObject({ grantAmount: 4500, ownFunds: 4500 })
    expect(baseline.setBaseline).toHaveBeenCalledWith({ grantAmount: 4500, ownFunds: 4500 })
  })

  it("recalculates values that still follow the last calculation", () => {
    const form = fakeForm({ planningCosts: 20000, grantAmount: 5000, ownFunds: 5000 })

    recalculateFundingOnBasisBlur(
      form,
      "planningCosts",
      fakeBaseline({ grantAmount: 5000, ownFunds: 5000 }),
    )

    expect(form.state.values).toMatchObject({ grantAmount: 10000, ownFunds: 10000 })
  })

  it("keeps values changed by hand", () => {
    const form = fakeForm({ planningCosts: 20000, grantAmount: 3000, ownFunds: 5000 })
    const baseline = fakeBaseline({ grantAmount: 5000, ownFunds: 5000 })

    recalculateFundingOnBasisBlur(form, "planningCosts", baseline)

    expect(form.state.values).toMatchObject({ grantAmount: 3000, ownFunds: 5000 })
    expect(baseline.setBaseline).not.toHaveBeenCalled()
  })

  it("does not fill in a negative calculation", () => {
    const form = fakeForm({ planningCosts: 10000, contributionsThirdParties: 50000 })

    recalculateFundingOnBasisBlur(form, "contributionsThirdParties", fakeBaseline(null))

    expect(form.setFieldValue).not.toHaveBeenCalled()
  })

  it("ignores fields outside the calculation basis", () => {
    const form = fakeForm({ planningCosts: 10000 })

    recalculateFundingOnBasisBlur(form, "grantAmount", fakeBaseline(null))

    expect(form.setFieldValue).not.toHaveBeenCalled()
  })
})
