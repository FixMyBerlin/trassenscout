import { describe, expect, test } from "vitest"
import { logEntryTarget, type LogEntryTargetSource } from "./logEntryTarget"

const empty: LogEntryTargetSource = {
  action: "UPDATE",
  uploadId: null,
  contactId: null,
  projectRecordId: null,
  acquisitionArea: null,
  surveyResponse: null,
  subsubsection: null,
  subsection: null,
}

const subsubsection = { slug: "m1", subsection: { slug: "pa1" } }

describe("logEntryTarget", () => {
  test("returns null without a relation", () => {
    expect(logEntryTarget(empty)).toBeNull()
  })

  test("returns null for deletions", () => {
    expect(logEntryTarget({ ...empty, action: "DELETE", projectRecordId: 5 })).toBeNull()
  })

  test("prefers the document over the survey response it belongs to", () => {
    expect(
      logEntryTarget({
        ...empty,
        uploadId: 3,
        surveyResponse: { id: 8, surveySession: { surveyId: 2 } },
      }),
    ).toEqual({ type: "upload", uploadId: 3 })
  })

  test("links comments to their project record", () => {
    expect(logEntryTarget({ ...empty, projectRecordId: 286 })).toEqual({
      type: "projectRecord",
      projectRecordId: 286,
    })
  })

  test("prefers the acquisition area over its Maßnahme", () => {
    expect(
      logEntryTarget({ ...empty, acquisitionArea: { id: 4, subsubsection }, subsubsection }),
    ).toEqual({
      type: "acquisitionArea",
      acquisitionAreaId: 4,
      subsectionSlug: "pa1",
      subsubsectionSlug: "m1",
    })
  })

  test("links survey responses with their survey", () => {
    expect(
      logEntryTarget({ ...empty, surveyResponse: { id: 8, surveySession: { surveyId: 2 } } }),
    ).toEqual({ type: "surveyResponse", surveyId: 2, surveyResponseId: 8 })
  })

  test("links Maßnahmen and Planungsabschnitte by slug", () => {
    expect(logEntryTarget({ ...empty, subsubsection })).toEqual({
      type: "subsubsection",
      subsectionSlug: "pa1",
      subsubsectionSlug: "m1",
    })
    expect(logEntryTarget({ ...empty, subsection: { slug: "pa1" } })).toEqual({
      type: "subsection",
      subsectionSlug: "pa1",
    })
  })
})
