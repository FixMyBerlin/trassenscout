import { expect, Page, test } from "@playwright/test"

const surveyTests = [
  {
    slug: "rstest-1-2-3",
    parts: ["part1", "part2", "part3"],
    initialScreen: {
      title: "RSTest 1-2-3",
    },
  },
  {
    slug: "rstest-2-3",
    parts: ["part2", "part3"],
    initialScreen: {
      title: "RSTest 2-3",
    },
  },
  {
    slug: "rstest-1",
    parts: ["part1"],
    initialScreen: {
      title: "RSTest 1",
    },
  },
  {
    slug: "rstest-2",
    parts: ["part2"],
    initialScreen: {
      title: "RSTest 2",
    },
  },
  // frm7 has a different part configuration - so we leave it out for now; we could add it below with a condition and import it from the frm-neu test file
  // {
  //   slug: "frm7",
  //   parts: ["part1", "part2"],
  //   initialScreen: {
  //     title: "FRM7",
  //   },
  // },
]

// Basic navigation test
surveyTests.forEach(({ slug, parts, initialScreen }) => {
  test(`Basic navigation test for ${slug}`, async ({ page }) => {
    await page.goto(`/beteiligung-neu/${slug}`)
    await expect(page.getByRole("heading", { name: initialScreen.title })).toBeVisible()
    await page.getByRole("button", { name: "Weiter" }).click()
    // this only works in dev as its a debug element
    await expect(page.getByText(`stage: ${parts[0]}`)).toBeVisible()
  })
})

// Complete end-to-end flow test for each survey
surveyTests.forEach(({ slug, parts }) => {
  test(`Complete flow test for ${slug}`, async ({ page }) => {
    await page.goto(`/beteiligung-neu/${slug}`)
    await page.getByRole("button", { name: "Weiter" }).click()
    // @ts-expect-error
    for (let i = 0; i < parts.length; i++) await fillRequiredFields(page, parts[i])
    await expect(page.getByText("Vielen Dank")).toBeVisible()
  })
})

async function fillRequiredFields(page: Page, part: "part1" | "part2" | "part3") {
  switch (part) {
    case "part1":
      await page.getByRole("checkbox", { name: "Auto", exact: true }).click()
      await page.locator('[id="verkehrsmittelBesitz\\[0\\]"]').click()
      await page.locator('[id="verkehrsmittelBesitz_min2\\[0\\]"]').click()
      await page.locator('[id="verkehrsmittelBesitz_min2\\[1\\]"]').click()
      await page.locator('[id="verkehrsmittelBesitz_max3\\[4\\]"]').click()
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
      await page.getByRole("textbox", { name: "Ihr Hinweis" }).click()
      await page.getByRole("textbox", { name: "Ihr Hinweis" }).fill("Hinweistext lorem ipsum")
      await page.getByRole("button", { name: "Absenden" }).click()
      break

    case "part3":
      await page.getByRole("button", { name: "Weiter" }).click()
      await page.getByRole("textbox", { name: "Nachname:" }).click()
      await page.getByRole("textbox", { name: "Nachname:" }).fill("Name")
      await page.getByRole("checkbox", { name: "Ich fahre manchmal Fahrrad" }).click()
      await page.getByRole("textbox", { name: "Case 2: Wie sicher fühlen Sie" }).click()
      await page.getByRole("textbox", { name: "Case 2: Wie sicher fühlen Sie" }).fill("Sehr sicher")
      await page.getByRole("radio", { name: "Auto" }).click()
      await page.getByRole("textbox", { name: "Welches Auto fahren Sie?" }).click()
      await page.getByRole("textbox", { name: "Welches Auto fahren Sie?" }).fill("Elektro")
      await page.getByRole("button", { name: "Weiter" }).click()
      await page.getByRole("radio", { name: "Ja" }).click()
      await page.getByRole("radio", { name: "Mehrmals im Monat" }).click()
      await page.getByRole("button", { name: "Absenden" }).click()
      break
  }
}
