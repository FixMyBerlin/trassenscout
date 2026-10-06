import { describe, expect, test } from "vitest"
import { InputNonNegativeNumberOrNullSchema, NON_NEGATIVE_AMOUNT_ERROR } from "./schema-shared"

describe("InputNonNegativeNumberOrNullSchema", () => {
  test("accepts empty input, 0 and positive amounts", () => {
    expect(InputNonNegativeNumberOrNullSchema.parse("")).toBeNull()
    expect(InputNonNegativeNumberOrNullSchema.parse("0")).toBe(0)
    expect(InputNonNegativeNumberOrNullSchema.parse("1250.5")).toBe(1250.5)
  })

  test("rejects negative amounts", () => {
    const result = InputNonNegativeNumberOrNullSchema.safeParse("-1")
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(NON_NEGATIVE_AMOUNT_ERROR)
  })
})
