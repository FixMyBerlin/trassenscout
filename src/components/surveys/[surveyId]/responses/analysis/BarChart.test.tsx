// @vitest-environment jsdom

import { render } from "@testing-library/react"
import { beforeAll, describe, expect, test } from "vitest"
import { BarChart } from "./BarChart"

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver = ResizeObserverMock
})

describe("BarChart", () => {
  test("mounts recharts without throwing", () => {
    const { container } = render(
      <div className="h-[220px] w-full">
        <BarChart
          data={[
            { name: "Option A", value: 3 },
            { name: "Option B", value: 7 },
          ]}
        />
      </div>,
    )

    expect(container.querySelector(".recharts-responsive-container")).toBeTruthy()
  })
})
