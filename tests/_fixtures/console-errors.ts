import { test as base } from "@/tests/_utils/support"

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const errors: string[] = []

    page.on("console", (message) => {
      if (message.type() !== "error") return

      errors.push(`[console.${message.type()}] ${message.text()}`)
    })

    page.on("pageerror", (error) => {
      errors.push(`[pageerror] ${error.message}`)
    })

    await use(page)

    if (!errors.length) return

    const body = errors.join("\n")
    await testInfo.attach("console-errors", {
      body,
      contentType: "text/plain",
    })

    throw new Error(`Unexpected console or page errors detected:\n${body}`)
  },
})
