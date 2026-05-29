import { expect, type Page } from "@playwright/test"

export const expectErrorPage = async (page: Page) => {
  await expect(page.getByRole("heading", { name: "Ein Fehler ist aufgetreten" })).toBeVisible({
    timeout: 30_000,
  })
}
