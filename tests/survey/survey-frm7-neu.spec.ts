// 100% happy path with one feedback without location

import { fakeTextarea } from "@/tests/_utils/faker"
import { mapDragPin } from "@/tests/_utils/mapDragPin"
import { expect, test } from "@/tests/_utils/support"

import { Page } from "@playwright/test"

const testIntro1 = async (page: Page) => {
  await expect(page.getByRole("heading", { name: "Ihre Meinung zählt!" })).toBeVisible()
  await page.getByRole("button", { name: "Weiter" }).click()
}
const testPart1 = async (page: Page) => {
  await expect(page.getByRole("heading", { name: "Ein kurzer Einstieg" })).toBeVisible()
  await page.getByRole("checkbox", { name: "Rollstuhl" }).first().click()
  await page.getByRole("checkbox", { name: "Fahrrad (ohne Motor)" }).nth(1).click()
  await page.getByRole("radio", { name: "Ich fahre kein Fahrrad" }).click()
  await page.getByRole("checkbox", { name: "Ich fahre Fahrrad, weil es" }).click()
  await page.getByRole("checkbox", { name: "Es gibt keine sichere" }).click()
  await page.getByRole("button", { name: "Weiter" }).click()
  await expect(page.getByRole("heading", { name: "Nutzung und Gestaltung FRM7" })).toBeVisible()
  await page.getByRole("radio", { name: "Nein", exact: true }).click()
  await page.getByRole("radio", { name: "Mehrmals pro Woche" }).click()
  await page.getByRole("checkbox", { name: "Einkaufen und Besorgungen" }).click()
  await page.getByRole("radio", { name: "Ja, wahrscheinlich ab und zu" }).click()
  await page.getByRole("radio", { name: "Ich fahre lieber auf sicheren" }).click()
  await page
    .getByLabel("Ein Weg, auf dem auch Fußgä")
    .getByRole("radio", { name: "Eher selten mit dem Rad" })
    .click()
  await page
    .getByLabel("Eine Fahrradstraße, auf der")
    .getByRole("radio", { name: "Eher selten mit dem Rad" })
    .click()
  await page.getByRole("button", { name: "Weiter" }).click()
  await expect(page.getByRole("heading", { name: "Über Sie" })).toBeVisible()
  await page.getByRole("radio", { name: "25 bis 29 Jahre" }).click()
  await page.getByRole("radio", { name: "Ja", exact: true }).click()
  await page.getByRole("radio", { name: "Männlich" }).click()
  await page.getByRole("radio", { name: "Realschulabschluss" }).click()
  await page
    .getByRole("radio", {
      name: "Meister-/Technikerschule, Fachschule, Berufs-/Fachakademie",
    })
    .click()
  await page.getByRole("checkbox", { name: "Ja, durch Gehbehinderung" }).click()
  await page.getByRole("button", { name: "Absenden" }).click()
}
const testIntro2 = async (page: Page) => {
  await expect(page.getByRole("heading", { name: "Ihre Hinweise und Wünsche" })).toBeVisible()
  await page.getByRole("button", { name: "Weiter" }).click()
}
const testPart2Finish = async (page: Page) => {
  await expect(page.getByRole("heading", { name: "Wir sind gespannt auf Ihre" })).toBeVisible()
  await page.getByRole("radio", { name: "Mögliche Konflikte" }).click()
  await page.getByRole("button", { name: "Weiter" }).click()
  await page.getByRole("radio", { name: "Nein" }).click()
  await page.getByRole("textbox", { name: "Was möchten Sie uns mitteilen?" }).click()
  await page.getByRole("textbox", { name: "Was möchten Sie uns mitteilen?" }).fill(fakeTextarea())
  await page.getByRole("textbox", { name: "Was möchten Sie uns mitteilen?" }).press("Alt+ArrowLeft")
  await page.getByRole("button", { name: "Absenden & Beteiligung" }).click()
}
const testPart2Again = async (page: Page) => {
  await page.getByRole("radio", { name: "Streckenführung" }).click()
  await page.getByRole("button", { name: "Weiter" }).click()
  await page.getByRole("radio", { name: "Nein" }).click()
  await page.getByRole("textbox", { name: "Was möchten Sie uns mitteilen?" }).click()
  await page.getByRole("textbox", { name: "Was möchten Sie uns mitteilen?" }).fill(fakeTextarea())
  await page.getByRole("textbox", { name: "Was möchten Sie uns mitteilen?" }).press("ArrowLeft")
  await page.getByRole("button", { name: "Absenden & weiteren Hinweis" }).click()
}
const testPart2FinishWithLocation = async ({ page }: { page: Page }) => {
  await page.getByRole("radio", { name: "Streckenführung" }).click()
  await page.getByRole("button", { name: "Weiter" }).click()
  await page.getByRole("radio", { name: "Ja" }).click()

  const mapElement = page.getByLabel("Map", { exact: true })
  const pinElement = page.getByLabel("Map marker", { exact: true })

  await mapDragPin({ page, mapElement, pinElement })

  await page.getByRole("textbox", { name: "Was möchten Sie uns mitteilen?" }).click()
  await page.getByRole("textbox", { name: "Was möchten Sie uns mitteilen?" }).fill(fakeTextarea())
  await page.getByRole("textbox", { name: "Was möchten Sie uns mitteilen?" }).press("Alt+ArrowLeft")
  await page.getByRole("button", { name: "Absenden & Beteiligung" }).click()
}
const testEnd = async (page: Page) => {
  await expect(page.getByRole("heading", { name: "Vielen Dank für Ihre" })).toBeVisible()
  await page.getByRole("link", { name: "Zurück zur Startseite" }).click()
  await expect(page).toHaveURL("https://radschnellweg-frm7.de/")
}

test("happy path # 1 - 1 feedback1 - no location", async ({ page }) => {
  await page.goto("/beteiligung/frm7")
  await testIntro1(page)
  await testPart1(page)
  await testIntro2(page)
  await testPart2Finish(page)
  await testEnd(page)
})
test("happy path # 3 - 1 feedback1 - with location", async ({ page }) => {
  test.fixme(
    true,
    "FRM7 location feedback currently needs a dedicated deterministic map interaction helper.",
  )

  await page.goto("/beteiligung/frm7")
  await testIntro1(page)
  await testPart1(page)
  await testIntro2(page)
  await testPart2FinishWithLocation({ page })
  await testEnd(page)
})
test("happy path # 2 - 3 feedbacks - no location", async ({ page }) => {
  await page.goto("/beteiligung/frm7")
  await testIntro1(page)
  await testPart1(page)
  await testIntro2(page)
  await testPart2Again(page)
  await testPart2Again(page)
  await testPart2Finish(page)
  await testEnd(page)
})
