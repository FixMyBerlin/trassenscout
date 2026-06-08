import { surveyNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { filloutAndTestPartOne } from "./_shared/filloutAndTestPartOne"

test.describe("Survey Brandenburg – part 1 only", () => {
  test.use({ allowedConsoleErrors: surveyNoise })

  test("complete just part 1", async ({ page }) => {
    await filloutAndTestPartOne(page)
    await page.getByRole("button", { name: "Beteiligung beenden" }).click()

    await expect(
      page.getByRole("heading", { name: "Vielen Dank für Ihre Teilnahme" }),
    ).toBeVisible()
  })
})
