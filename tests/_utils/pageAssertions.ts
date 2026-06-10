import { expect, type Page } from "@playwright/test"

/** TanStack redirects may append ?from= or ?callbackURL= search params. */
export const dashboardUrl = /\/dashboard(\?.*)?$/
export const loginUrl = /\/auth\/login(\?.*)?$/
export const accessDeniedUrl = /\/access-denied(\?.*)?$/

export const expectDashboardRedirect = async (page: Page) => {
  await expect(page).toHaveURL(dashboardUrl, { timeout: 30_000 })
}

export const expectAccessDeniedRedirect = async (page: Page) => {
  await expect(page).toHaveURL(accessDeniedUrl, { timeout: 30_000 })
  await expect(page.getByRole("heading", { name: "Zugriff verweigert", exact: true })).toBeVisible({
    timeout: 30_000,
  })
}

export const expectErrorPage = async (page: Page) => {
  await expect(page.getByRole("heading", { name: "Zugriff verweigert", exact: true })).toBeVisible({
    timeout: 30_000,
  })
}
