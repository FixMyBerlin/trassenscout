// @vitest-environment jsdom

import type { FileUploadInfo } from "@better-upload/client"
import { act, renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { useUploadProtocol } from "./useUploadProtocol"
import type { UploadFileRecordResult } from "./useUploadRecordCreation"

const recorded = (name: string, replacedUploadId: number | null) =>
  ({
    file: { name } as FileUploadInfo<"complete">,
    ok: true,
    upload: { id: 1 },
    replacedUploadId,
  }) as UploadFileRecordResult

const twoFilesNamed = (name: string) => [{ name }, { name }]

describe("useUploadProtocol", () => {
  test("labels only the file that actually replaced, not its duplicate", () => {
    const { result } = renderHook(() => useUploadProtocol())

    act(() => result.current.startBatch(twoFilesNamed("foto.png"), { "foto.png": "replace" }))
    // The router hands the record to the first file; the second is added alongside
    act(() => result.current.recordResult(recorded("foto.png", 12)))
    act(() => result.current.recordResult(recorded("foto.png", null)))

    expect(result.current.entries.map((entry) => entry.existingCollisionResolution)).toEqual([
      "replace",
      undefined,
    ])
    expect(result.current.entries.every((entry) => entry.collidesInBatch)).toBe(true)
  })

  test("keeping both applies to every file of that name", () => {
    const { result } = renderHook(() => useUploadProtocol())

    act(() => result.current.startBatch(twoFilesNamed("foto.png"), { "foto.png": "keepBoth" }))

    expect(result.current.entries.map((entry) => entry.existingCollisionResolution)).toEqual([
      "keepBoth",
      "keepBoth",
    ])
  })

  test("leaves files without a conflict unlabelled", () => {
    const { result } = renderHook(() => useUploadProtocol())

    act(() => result.current.startBatch([{ name: "neu.pdf" }]))
    act(() => result.current.recordResult(recorded("neu.pdf", null)))

    expect(result.current.entries).toEqual([
      expect.objectContaining({
        filename: "neu.pdf",
        status: "success",
        existingCollisionResolution: undefined,
        collidesInBatch: false,
      }),
    ])
  })
})
