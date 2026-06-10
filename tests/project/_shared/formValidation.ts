import { expect, type Page } from "@playwright/test"
import { waitForFormReady, waitForSubmitReady } from "@/tests/_utils/waitForFormReady"

type FormValidationConfig = {
  page: Page
  labels?: string[]
  submitButtonName: string
  stayOnUrl: RegExp | string
}

export async function assertFormValidationOnEmptySubmit({
  page,
  labels = [],
  submitButtonName,
  stayOnUrl,
}: FormValidationConfig) {
  if (labels.length > 0) {
    await waitForFormReady(page, labels)
  }
  await waitForSubmitReady(page, submitButtonName)
  await page.getByRole("button", { name: submitButtonName, exact: true }).click()
  await expect(
    page.getByRole("alert").filter({ hasText: "Bitte korrigieren Sie Ihre Angaben." }),
  ).toBeVisible({
    timeout: 15_000,
  })
  await expect(page).toHaveURL(stayOnUrl, { timeout: 5_000 })
}
