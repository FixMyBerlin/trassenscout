import { Page, expect } from "@playwright/test"
import { fakeEmail, fakeFirstname, fakeLastname, fakeTextarea } from "../../_utils/faker"

export async function filloutAndTestPartOne(page: Page) {
  await page.goto("/beteiligung/radnetz-brandenburg?id=u-fixmycity")

  // The part1 intro uses the framework-level "Weiter" button (not "Beteiligung starten").
  await page.getByRole("button", { name: "Weiter" }).click()

  await page.getByRole("textbox", { name: "Vorname" }).fill(fakeFirstname())
  await page.getByRole("textbox", { name: "Nachname" }).fill(fakeLastname())
  await page.getByRole("textbox", { name: "E-Mail-Adresse" }).fill(fakeEmail())
  await page.getByRole("textbox", { name: "PIN (4-stellig)" }).fill("1234")
  await page.getByRole("button", { name: "Weiter" }).click()
  await expect(page.getByRole("heading", { name: "Allgemeine Fragen" })).toBeVisible()
  await page.getByRole("radio", { name: /Sehr gut/ }).click()
  await page
    .getByRole("textbox", { name: "Was würden Sie dazu gerne noch ergänzen?" })
    .fill(fakeTextarea())
  await page.getByRole("button", { name: "Absenden" }).click()
}
