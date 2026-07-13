import { describe, expect, it } from "vitest"
import { getUploadServeHeaders } from "./serveHeaders"

describe("getUploadServeHeaders", () => {
  it("always sets nosniff", () => {
    expect(getUploadServeHeaders("application/pdf")["X-Content-Type-Options"]).toBe("nosniff")
  })

  it("does not force download for previewable types by default", () => {
    expect(getUploadServeHeaders("application/pdf")["Content-Disposition"]).toBeUndefined()
    expect(getUploadServeHeaders("image/png")["Content-Disposition"]).toBeUndefined()
  })

  it("forces attachment for active (spoofable) content types even without forceDownload", () => {
    expect(getUploadServeHeaders("image/svg+xml")["Content-Disposition"]).toBe("attachment")
    expect(getUploadServeHeaders("text/html")["Content-Disposition"]).toBe("attachment")
    expect(getUploadServeHeaders("application/xhtml+xml")["Content-Disposition"]).toBe("attachment")
  })

  it("forces attachment for previewable types when forceDownload is set", () => {
    expect(
      getUploadServeHeaders("application/pdf", { forceDownload: true })["Content-Disposition"],
    ).toBe("attachment")
  })

  it("includes an ASCII fallback and an RFC 5987 UTF-8 filename", () => {
    const disposition = getUploadServeHeaders("application/pdf", {
      forceDownload: true,
      filename: "Bericht Öffnungszeiten.pdf",
    })["Content-Disposition"]

    // Non-ASCII chars are stripped from the quoted ASCII fallback...
    expect(disposition).toContain(`filename="Bericht _ffnungszeiten.pdf"`)
    // ...and preserved (percent-encoded) in the filename* parameter.
    expect(disposition).toContain(`filename*=UTF-8''Bericht%20%C3%96ffnungszeiten.pdf`)
  })

  it("escapes RFC 5987 special characters that encodeURIComponent leaves raw", () => {
    const disposition = getUploadServeHeaders("application/pdf", {
      forceDownload: true,
      filename: "a'(b)*.pdf",
    })["Content-Disposition"]

    expect(disposition).toContain(`filename*=UTF-8''a%27%28b%29%2A.pdf`)
  })

  it("neutralizes quotes and backslashes in the ASCII fallback", () => {
    const disposition = getUploadServeHeaders("application/pdf", {
      forceDownload: true,
      filename: `a"b\\c.pdf`,
    })["Content-Disposition"]

    expect(disposition).toContain(`filename="a_b_c.pdf"`)
  })
})
