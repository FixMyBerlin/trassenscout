// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { ProjectRecordEditingStateButton } from "./ProjectRecordEditingStateButton"

const labels = {
  complete: "Als abgeschlossen markieren",
  reopen: "Wiedereröffnung und als in Bearbeitung markieren",
}

describe("ProjectRecordEditingStateButton", () => {
  test("marks a record in progress as done", () => {
    const onToggle = vi.fn()
    render(
      <ProjectRecordEditingStateButton
        editingState={ProjectRecordEditingState.PENDING}
        labels={labels}
        onToggle={onToggle}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: labels.complete }))

    expect(onToggle).toHaveBeenCalledWith(ProjectRecordEditingState.COMPLETED)
  })

  test("reopens a done record", () => {
    const onToggle = vi.fn()
    render(
      <ProjectRecordEditingStateButton
        editingState={ProjectRecordEditingState.COMPLETED}
        labels={labels}
        onToggle={onToggle}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: labels.reopen }))

    expect(onToggle).toHaveBeenCalledWith(ProjectRecordEditingState.PENDING)
  })

  test("does nothing while disabled", () => {
    const onToggle = vi.fn()
    render(
      <ProjectRecordEditingStateButton
        editingState={ProjectRecordEditingState.PENDING}
        labels={labels}
        onToggle={onToggle}
        disabled
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: labels.complete }))

    expect(onToggle).not.toHaveBeenCalled()
  })
})
