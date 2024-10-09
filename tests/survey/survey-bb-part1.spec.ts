import { expect, test } from "@playwright/test"
import { filloutAndTestPartOne } from "./filloutAndTestPartOne"

test("survey brandenburg: complete just part 1", async ({ page }) => {
  await filloutAndTestPartOne(page)
  await page.getByRole("button", { name: "Beteiligung beenden" }).click()

  await expect(page.getByRole("heading", { name: "Vielen Dank für Ihre Teilnahme" })).toBeVisible()
})
