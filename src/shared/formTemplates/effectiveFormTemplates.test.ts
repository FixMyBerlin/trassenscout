import { describe, expect, it } from "vitest"
import { type FormTemplateRef, getEffectiveFormTemplates } from "./effectiveFormTemplates"

const antrag: FormTemplateRef = {
  id: 1,
  title: "Antrag",
  slug: "antrag",
  type: "SUBSUBSECTION",
  projects: [{ slug: "rs23" }],
}
const mittelabruf: FormTemplateRef = {
  id: 2,
  title: "Mittelabruf",
  slug: "mittelabruf",
  type: "SUBSUBSECTION",
  projects: [{ slug: "rs23" }],
}
const verzicht: FormTemplateRef = {
  id: 3,
  title: "Verzicht",
  slug: "verzicht",
  type: "ACQUISITIONAREA",
  projects: [{ slug: "rs23" }],
}

const inSubsubsection = { projectSlug: "rs23", hasSubsubsection: true, hasAcquisitionArea: false }

describe("getEffectiveFormTemplates", () => {
  it("offers nothing without a Maßnahme or Verhandlungsfläche", () => {
    expect(
      getEffectiveFormTemplates(
        { formTemplates: [antrag, mittelabruf] },
        {
          projectSlug: "rs23",
          hasSubsubsection: false,
          hasAcquisitionArea: false,
        },
      ),
    ).toEqual([])
  })

  it("offers the forms the record carries", () => {
    expect(getEffectiveFormTemplates({ formTemplates: [antrag] }, inSubsubsection)).toEqual([
      antrag,
    ])
  })

  it("sorts by title", () => {
    const result = getEffectiveFormTemplates(
      { formTemplates: [mittelabruf, antrag] },
      inSubsubsection,
    )
    expect(result.map((formTemplate) => formTemplate.id)).toEqual([1, 2])
  })

  it("hides forms that do not match the record's relation", () => {
    expect(
      getEffectiveFormTemplates({ formTemplates: [antrag, verzicht] }, inSubsubsection),
    ).toEqual([antrag])

    expect(
      getEffectiveFormTemplates(
        { formTemplates: [antrag, verzicht] },
        { projectSlug: "rs23", hasSubsubsection: false, hasAcquisitionArea: true },
      ),
    ).toEqual([verzicht])
  })

  it("shows both kinds when the record has both relations", () => {
    expect(
      getEffectiveFormTemplates(
        { formTemplates: [antrag, verzicht] },
        { projectSlug: "rs23", hasSubsubsection: true, hasAcquisitionArea: true },
      ),
    ).toHaveLength(2)
  })

  it("offers nothing when the record carries no forms", () => {
    expect(getEffectiveFormTemplates({ formTemplates: [] }, inSubsubsection)).toEqual([])
  })
})

describe("project scope", () => {
  const otherProjectForm: FormTemplateRef = {
    id: 9,
    title: "Antrag Projekt B",
    slug: "antrag-b",
    type: "SUBSUBSECTION",
    projects: [{ slug: "rs3000" }],
  }

  it("hides a form the record's project cannot open", () => {
    expect(
      getEffectiveFormTemplates({ formTemplates: [otherProjectForm] }, inSubsubsection),
    ).toEqual([])
  })

  it("keeps a form available in several projects including this one", () => {
    const shared: FormTemplateRef = {
      ...otherProjectForm,
      projects: [{ slug: "rs3000" }, { slug: "rs23" }],
    }
    expect(getEffectiveFormTemplates({ formTemplates: [shared] }, inSubsubsection)).toEqual([
      shared,
    ])
  })
})
