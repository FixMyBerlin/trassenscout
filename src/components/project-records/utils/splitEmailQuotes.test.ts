import { describe, expect, test } from "vitest"
import { splitEmailQuotes } from "./splitEmailQuotes"

describe("splitEmailQuotes", () => {
  test("groups a forwarded reply by quote depth and drops the markers", () => {
    const text = [
      "Bitte ins Protokoll aufnehmen.",
      "",
      "> Am 02.03.2026 um 15:36 schrieb Ada Beispiel <ada@example.org>:",
      ">",
      ">",
      ">",
      ">> Anfang der weitergeleiteten Nachricht:",
      ">>",
      ">> Von: <brit@example.org>",
      "> > Betreff: Prozessworkshop Teil II",
    ].join("\r\n")

    expect(splitEmailQuotes(text)).toEqual([
      { depth: 0, text: "Bitte ins Protokoll aufnehmen." },
      { depth: 1, text: "Am 02.03.2026 um 15:36 schrieb Ada Beispiel <ada@example.org>:" },
      {
        depth: 2,
        text: "Anfang der weitergeleiteten Nachricht:\n\nVon: <brit@example.org>\nBetreff: Prozessworkshop Teil II",
      },
    ])
  })

  test("keeps a leading > that belongs to the text", () => {
    expect(splitEmailQuotes(">2000 Fahrten pro Tag\n>= 2,50 m Breite")).toEqual([
      { depth: 0, text: ">2000 Fahrten pro Tag\n>= 2,50 m Breite" },
    ])
  })

  test("caps deep quotes at three levels", () => {
    expect(splitEmailQuotes(`${">".repeat(2000)} tief\n>>>> auch tief`)).toEqual([
      { depth: 3, text: "tief\nauch tief" },
    ])
  })

  test("keeps a mail without quotes as one block, without attachment placeholders", () => {
    expect(splitEmailQuotes("Guten Tag,\n\n\n\nanbei das Protokoll.\n\n\uFFFC")).toEqual([
      { depth: 0, text: "Guten Tag,\n\nanbei das Protokoll." },
    ])
  })
})
