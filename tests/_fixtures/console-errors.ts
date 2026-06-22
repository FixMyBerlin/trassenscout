import { test as base } from "@/tests/_utils/support"

type ConsoleErrorFixtures = {
  allowedConsoleErrors: Array<string | RegExp>
}

const isAllowedError = (message: string, allowedErrors: Array<string | RegExp>) =>
  allowedErrors.some((allowedError) =>
    typeof allowedError === "string" ? message.includes(allowedError) : allowedError.test(message),
  )

export const test = base.extend<ConsoleErrorFixtures>({
  allowedConsoleErrors: [[], { option: true }],
  page: async ({ page, allowedConsoleErrors }, use, testInfo) => {
    const errors: string[] = []

    page.on("console", (message) => {
      if (message.type() !== "error") return

      const formattedMessage = `[console.${message.type()}] ${message.text()}`
      if (isAllowedError(formattedMessage, allowedConsoleErrors)) return

      errors.push(formattedMessage)
    })

    page.on("pageerror", (error) => {
      const stack = error.stack ? `\n${error.stack}` : ""
      const formattedMessage = `[pageerror] ${error.message}${stack}`
      if (isAllowedError(formattedMessage, allowedConsoleErrors)) return

      errors.push(formattedMessage)
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
