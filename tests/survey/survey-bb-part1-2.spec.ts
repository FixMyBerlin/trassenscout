import { expect, test } from "@playwright/test"
import { fakeTextarea } from "../_utils/faker"
import { waitForMapLoad } from "../utils/maps"
import { filloutAndTestPartOne } from "./_shared/filloutAndTestPartOne"

test("survey brandenburg: complete part 1 and 2 (part 2 once)", async ({ page }) => {
  test.fixme(
    true,
    "Radnetz Brandenburg line selection is currently not deterministic in Playwright.",
  )

  // Part 1:
  await filloutAndTestPartOne(page)
  await page.getByRole("button", { name: "Weiter zur Abgabe von" }).click()

  // Part 2 – Page 1:
  await waitForMapLoad(page)

  await expect(page.getByLabel("Map")).toBeInViewport()
  await page.getByLabel("Map").click({
    position: {
      x: 545,
      y: 258,
    },
  })
  expect(
    page.getByText("Linie von Landesgrenze BE (Hoppegarten/B1) nach Müncheberg ist ausgewählt"),
  ).toBeTruthy()

  // Radio button group:
  await page.getByText("Anderes Thema").click()
  await page.getByRole("button", { name: "Weiter" }).click()

  // Part 2 – Page 2:
  await page.getByText("Nein, ich möchte keine").click()
  await page.getByPlaceholder("Beantworten Sie hier...").click()
  await page.getByPlaceholder("Beantworten Sie hier...").fill(fakeTextarea())
  await page.getByRole("button", { name: "Speichern & Beteiligung" }).click()
})
