import { describe, expect, test } from "vitest"
import { externalShareMailtoHref } from "./externalShareMail"

const shareUrl = "https://trassenscout.de/share/AbC_123-xyz"

const parse = (href: string) => {
  const url = new URL(href)
  return {
    recipient: url.pathname,
    subject: url.searchParams.get("subject"),
    lines: url.searchParams.get("body")?.split("\r\n") ?? [],
  }
}

describe("externalShareMailtoHref", () => {
  test("prefills subject and body with the project name, link and sender", () => {
    const mail = parse(
      externalShareMailtoHref({ shareUrl, projectName: "RS23", senderName: "Erika Muster" }),
    )

    expect(mail.recipient).toBe("")
    expect(mail.subject).toBe("Ihr Zugang zu den Projektunterlagen von RS23")
    expect(mail.lines[0]).toBe(
      "Über den folgenden Link erhalten Sie Zugriff auf die Anwendung „Trassenscout“ für den Radschnellweg „RS23“.",
    )
    expect(mail.lines[2]).toBe(shareUrl)
    expect(mail.lines.slice(-3)).toEqual(["", "Mit freundlichen Grüßen", "Erika Muster"])
  })

  test("ends with the greeting when the sender has no name", () => {
    const mail = parse(externalShareMailtoHref({ shareUrl, projectName: "RS23", senderName: null }))

    expect(mail.lines.slice(-2)).toEqual(["", "Mit freundlichen Grüßen"])
  })
})
