import { describe, expect, test } from "vitest"
import { getUploadReturnTarget } from "./getUploadReturnTarget"

const target = (returnTo?: string) => getUploadReturnTarget({ projectSlug: "rs23", returnTo })

const documents = { returnPath: "/rs23/uploads", returnText: "Zurück zu den Dokumenten" }

describe("getUploadReturnTarget", () => {
  test("goes to the documents when there is no return path", () => {
    expect(target()).toEqual(documents)
  })

  test("ignores return paths outside the project", () => {
    expect(target("/rs8/project-records/12")).toEqual(documents)
    expect(target("/dashboard?modalProjectRecordId=12&modalProjectRecordView=detail")).toEqual(
      documents,
    )
  })

  test.each([
    "/rs23/project-records/12",
    "/rs23/project-records/12/edit",
    "/rs23/project-records?modalProjectRecordId=12&modalProjectRecordView=detail",
    "/rs23?modalProjectRecordId=12&modalProjectRecordView=detail",
  ])("leads back to the Protokolleintrag from %s", (returnTo) => {
    expect(target(returnTo)).toEqual({
      returnPath: returnTo,
      returnText: "Zurück zum Protokolleintrag",
    })
  })

  test("says „Zurück“ when the record modal has no view and stays closed", () => {
    expect(target("/rs23/project-records?modalProjectRecordId=12")).toEqual({
      returnPath: "/rs23/project-records?modalProjectRecordId=12",
      returnText: "Zurück",
    })
  })

  test("ignores the record modal when a second modal closes both", () => {
    const returnTo =
      "/rs23/uploads?modalUploadId=5&modalUploadView=detail&modalProjectRecordId=12&modalProjectRecordView=detail"

    expect(target(returnTo)).toEqual({
      returnPath: returnTo,
      returnText: "Zurück zu den Dokumenten",
    })
  })

  test("leads back to the documents list with its search kept", () => {
    expect(target("/rs23/uploads?modalUploadId=5&modalUploadView=detail")).toEqual({
      returnPath: "/rs23/uploads?modalUploadId=5&modalUploadView=detail",
      returnText: "Zurück zu den Dokumenten",
    })
  })

  test("says „Zurück“ for any other page of the project", () => {
    expect(target("/rs23/abschnitte/a1")).toEqual({
      returnPath: "/rs23/abschnitte/a1",
      returnText: "Zurück",
    })
  })
})
