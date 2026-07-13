import { describe, expect, test } from "vitest"
import { sendCsvResponse } from "./sendCsvResponse.server"

describe("sendCsvResponse", () => {
  test("returns a CSV attachment response", async () => {
    const response = sendCsvResponse(
      [
        { id: "id", title: "frage_id" },
        { id: "question", title: "frage" },
      ],
      [{ id: "q1", question: "Wie zufrieden?" }],
      "export.csv",
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("text/csv")
    expect(response.headers.get("Content-Disposition")).toBe("attachment; filename=export.csv")

    const body = await response.text()
    expect(body).toContain("frage_id")
    expect(body).toContain("Wie zufrieden?")
  })
})
