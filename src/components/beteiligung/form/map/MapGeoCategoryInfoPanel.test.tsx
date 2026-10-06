// @vitest-environment jsdom

import { createFormHook } from "@tanstack/react-form"
import { act, render, screen } from "@testing-library/react"
import { createRef, type Ref, useImperativeHandle } from "react"
import { describe, expect, test, vi } from "vitest"
import { fieldContext, formContext } from "@/src/components/beteiligung/shared/hooks/form-context"
import { SurveyMapGeoCategoryInfoPanel } from "./MapGeoCategoryInfoPanel"

vi.mock("@/src/components/core/components/AdminBox/SuperAdminBox", () => ({
  SuperAdminBox: () => null,
}))

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
})

type HarnessHandle = { selectStop: (id: string, name: string) => void }

// Mirrors the survey: the panel sits in the map field, while a click writes *other* fields.
function Harness({ ref }: { ref: Ref<HarnessHandle> }) {
  const form = useAppForm({
    defaultValues: {
      geometryCategory: null as string | null,
      geometryCategoryId: null as string | null,
      hsName: null as string | null,
    },
  })
  useImperativeHandle(ref, () => ({
    selectStop: (id, name) => {
      form.setFieldValue("geometryCategoryId", id)
      form.setFieldValue("hsName", name)
    },
  }))

  return (
    <form.AppField name="geometryCategory">
      {() => (
        <SurveyMapGeoCategoryInfoPanel
          infoPanelText="Wählen Sie eine Bushaltestelle aus."
          additionalData={[
            { dataKey: "hsName", propertyName: "stop_name", label: "Name der Haltestelle" },
          ]}
          geoCategoryIdDefinition={{ dataKey: "geometryCategoryId", propertyName: "stop_id" }}
        />
      )}
    </form.AppField>
  )
}

const renderPanel = () => {
  const harness = createRef<HarnessHandle>()
  render(<Harness ref={harness} />)
  return (id: string, name: string) => act(() => harness.current?.selectStop(id, name))
}

describe("SurveyMapGeoCategoryInfoPanel", () => {
  test("asks for a stop until one is selected", () => {
    renderPanel()

    expect(screen.getByText("Wählen Sie eine Bushaltestelle aus.")).toBeTruthy()
  })

  test("shows the selected stop's name, though nothing above the panel re-renders", () => {
    const selectStop = renderPanel()

    selectStop("1234", "Birkenwerder, Am Quast")

    expect(screen.getByText("Birkenwerder, Am Quast")).toBeTruthy()
    expect(screen.queryByText("Wählen Sie eine Bushaltestelle aus.")).toBeNull()
  })

  test("follows a switch to another stop", () => {
    const selectStop = renderPanel()

    selectStop("1234", "Birkenwerder, Am Quast")
    selectStop("5678", "Liebenberg, Fichten")

    expect(screen.getByText("Liebenberg, Fichten")).toBeTruthy()
    expect(screen.queryByText("Birkenwerder, Am Quast")).toBeNull()
  })

  test("lists multi-value properties comma-separated", () => {
    const selectStop = renderPanel()

    selectStop("1234", JSON.stringify(["Linie 830", "Linie 845"]))

    expect(screen.getByText("Linie 830, Linie 845")).toBeTruthy()
  })
})
