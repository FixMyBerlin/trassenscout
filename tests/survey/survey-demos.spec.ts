import { surveyNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { Page } from "@playwright/test"

type SurveyPart = "part1" | "part2" | "part3"

const surveyTests: Array<{
  slug: string
  parts: SurveyPart[]
  initialScreen: { title: string }
}> = [
  {
    slug: "rstest-1-2-3",
    parts: ["part1", "part2", "part3"],
    initialScreen: {
      title: "RSTest 1-2-3 Survey Ihre Meinung zählt!",
    },
  },
  {
    slug: "rstest-2-3",
    parts: ["part2", "part3"],
    initialScreen: {
      title: "RSTest 2-3 In dieser Umfrage steigen wir direkt ein: Ihre Hinweise und Wünsche",
    },
  },
  {
    slug: "rstest-1",
    parts: ["part1"],
    initialScreen: {
      title: "RSTest 1 Willkommen zur Online-Beteiligung RS Test 1",
    },
  },
  {
    slug: "rstest-2",
    parts: ["part2"],
    initialScreen: {
      title: "RSTest 2 In dieser Umfrage steigen wir direkt ein: Ihre Hinweise und Wünsche",
    },
  },
]

test.describe("Survey demos", () => {
  test.use({ allowedConsoleErrors: surveyNoise })

  surveyTests.forEach(({ slug, parts, initialScreen }) => {
    test(`Basic navigation test for ${slug}`, async ({ page }) => {
      await page.goto(`/beteiligung/${slug}`)
      await expect(page.getByRole("heading", { name: initialScreen.title })).toBeVisible()
      await page.getByRole("button", { name: "Weiter" }).click()
      await expect(page.getByText(`stage: ${parts[0]}`)).toBeVisible()
    })
  })

  surveyTests.forEach(({ slug, parts }) => {
    test(`Complete flow test for ${slug}`, async ({ page }) => {
      await page.goto(`/beteiligung/${slug}`)
      await page.getByRole("button", { name: "Weiter" }).click()
      for (const part of parts) await fillRequiredFields(page, part)
      await expect(page.getByText("Vielen Dank")).toBeVisible()
    })
  })
})

async function fillRequiredFields(page: Page, part: SurveyPart) {
  switch (part) {
    case "part1":
      await page.locator("#verkehrsmittelNutzung\\[6\\]").click()
      await page.locator("#verkehrsmittelBesitz_min2\\[0\\]").click()
      await page.locator("#verkehrsmittelBesitz_min2\\[1\\]").click()
      await page.locator("#verkehrsmittelBesitz_max3\\[4\\]").click()
      await page.getByRole("button", { name: "Weiter" }).click()
      await page.getByRole("radio", { name: "Nein" }).click()
      await page.getByRole("radio", { name: "Ich fahre gern in ruhigen" }).click()
      await page.getByRole("radio", { name: "Mit dem Rad nutzen.", exact: true }).click()
      await page.getByRole("button", { name: "Absenden" }).click()
      break

    case "part2":
      await page.getByRole("button", { name: "Weiter" }).click()
      await page.getByRole("radio", { name: "Nutzung" }).click()
      await page.getByRole("button", { name: "Weiter" }).click()
      await page.getByRole("radio", { name: "Nein" }).click()
      await page.getByRole("textbox", { name: "Ihr Hinweis" }).fill("Hinweistext lorem ipsum")
      await page.getByRole("button", { name: "Absenden" }).click()
      break

    case "part3":
      await page.getByRole("button", { name: "Weiter" }).click()
      await page.getByRole("textbox", { name: "Nachname" }).fill("Name")
      await page.getByRole("checkbox", { name: "Ja, ich möchte zustimmen." }).click()
      await page.getByRole("checkbox", { name: "Ich fahre manchmal Fahrrad" }).click()
      await page
        .getByRole("textbox", { name: "Case 2: Wie sicher fühlen Sie sich beim Radfahren?" })
        .fill("Sehr sicher")
      await page.getByRole("radio", { name: "Auto" }).click()
      await page.getByRole("textbox", { name: "Welches Auto fahren Sie?" }).fill("Elektro")
      await page.getByRole("button", { name: "Weiter" }).click()
      await page.getByRole("radio", { name: "Ja" }).click()
      await page.getByRole("radio", { name: "Mehrmals im Monat" }).click()
      await page.getByRole("button", { name: "Absenden" }).click()
      break
  }
}
