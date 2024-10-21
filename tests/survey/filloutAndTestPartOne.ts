import { Page, expect } from "@playwright/test"
import { fakeEmail, fakeFirstname, fakeInt, fakeLastname, fakeTextarea } from "../_utils/faker"

export async function filloutAndTestPartOne(page: Page) {
  await page.goto("/beteiligung/radnetz-brandenburg?id=u-fixmycity")

  // Testing the details>summary Module is not worth it…
  // await page.getByText("Häufige Fragen").click()
  // await page.getByText("Was bedeutet baulastträgerü").click()
  // await expect(
  //   page.getByText("Was bedeutet baulastträgerübergreifendes Radnetz?Mit dem „Radnetz Brandenburg“-"),
  // )
  await page.getByRole("button", { name: "Beteiligung starten" }).click()

  await page.locator("#text-1").click()
  await page.locator("#text-1").fill(fakeFirstname())
  await page.locator("#text-1").press("Tab")
  await page.locator("#text-2").fill(fakeLastname())
  await page.locator("#text-2").press("Tab")

  const weiterButton = page.getByRole("button", { name: "Weiter" })
  await expect(weiterButton).toBeDisabled()

  await page.locator("#text-3").click()
  await page.locator("#text-3").fill(fakeEmail())
  await page.locator("#text-3").press("Tab")
  await page.locator("#text-4").fill(fakeInt().toString())
  await page.getByRole("button", { name: "Weiter" }).click()
  await page.locator("label").filter({ hasText: "Sehr gut" }).click()
  await page.getByLabel("", { exact: true }).click()
  await page.getByLabel("", { exact: true }).fill(fakeTextarea())
  await page.getByRole("button", { name: "Antworten speichern und weiter" }).click()
}
