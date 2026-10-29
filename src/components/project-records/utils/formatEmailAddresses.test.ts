import { expect, test } from "vitest"
import { formatEmailAddresses } from "./formatEmailAddresses"

test("drops the quotes around a display name, but keeps them where a comma needs them", () => {
  expect(formatEmailAddresses('"Ada Beispiel" <ada@example.org>')).toBe(
    "Ada Beispiel <ada@example.org>",
  )
  expect(
    formatEmailAddresses('"Beispiel, Brit" <brit@example.org>, "Ada Beispiel" <ada@example.org>'),
  ).toBe('"Beispiel, Brit" <brit@example.org>, Ada Beispiel <ada@example.org>')
})
