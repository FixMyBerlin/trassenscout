import { expect, type Page } from "@playwright/test"

/** Wait until form fields have hydrated and are interactive (Playwright-recommended). */
export async function waitForFormReady(page: Page, labels: string[]) {
  for (const label of labels) {
    await expect(page.getByLabel(label, { exact: true })).toBeEnabled({ timeout: 30_000 })
  }
}

/** Wait until a submit button is enabled after hydration. */
export async function waitForSubmitReady(page: Page, submitButtonName: string) {
  await expect(page.getByRole("button", { name: submitButtonName, exact: true })).toBeEnabled({
    timeout: 30_000,
  })
}
