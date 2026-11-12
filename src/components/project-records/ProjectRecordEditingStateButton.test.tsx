// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { ProjectRecordEditingState, ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { ProjectRecordEditingStateButton } from "./ProjectRecordEditingStateButton"

const { patchProjectRecordAssignmentFn } = vi.hoisted(() => ({
  patchProjectRecordAssignmentFn: vi.fn(),
}))

vi.mock("@/src/server/projectRecords/projectRecords.functions", () => ({
  patchProjectRecordAssignmentFn,
}))
vi.mock("@/src/components/project-records/projectRecordQueryCache", () => ({
  invalidateAfterProjectRecordPatch: vi.fn(),
}))

const projectRecord = (
  editingState: ProjectRecordEditingState,
  reviewState: ProjectRecordReviewState = ProjectRecordReviewState.APPROVED,
) => ({ id: 12, editingState, reviewState, project: { slug: "ohv" } })

function renderButton(record: ReturnType<typeof projectRecord>) {
  const queryClient = new QueryClient()
  const ui = (current: ReturnType<typeof projectRecord>) => (
    <QueryClientProvider client={queryClient}>
      <ProjectRecordEditingStateButton projectRecord={current} />
    </QueryClientProvider>
  )
  const { rerender } = render(ui(record))
  return { rerender: (next: ReturnType<typeof projectRecord>) => rerender(ui(next)) }
}

const sentPatch = () => patchProjectRecordAssignmentFn.mock.calls[0]?.[0]

describe("ProjectRecordEditingStateButton", () => {
  beforeEach(() => {
    patchProjectRecordAssignmentFn.mockReset().mockResolvedValue({})
  })

  test("marks a record in progress as done and sends only the status", async () => {
    renderButton(projectRecord(ProjectRecordEditingState.PENDING))

    fireEvent.click(screen.getByRole("button", { name: "Als abgeschlossen markieren" }))

    await waitFor(() =>
      expect(sentPatch()).toStrictEqual({
        data: { projectSlug: "ohv", id: 12, editingState: ProjectRecordEditingState.COMPLETED },
      }),
    )
  })

  test("reopens a done record", async () => {
    renderButton(projectRecord(ProjectRecordEditingState.COMPLETED))

    fireEvent.click(
      screen.getByRole("button", { name: "Wiedereröffnung und als in Bearbeitung markieren" }),
    )

    await waitFor(() =>
      expect(sentPatch()).toStrictEqual({
        data: { projectSlug: "ohv", id: 12, editingState: ProjectRecordEditingState.PENDING },
      }),
    )
  })

  test("is hidden on KI drafts that still need a confirmation", () => {
    renderButton(
      projectRecord(ProjectRecordEditingState.PENDING, ProjectRecordReviewState.NEEDSREVIEW),
    )

    expect(screen.queryByRole("button")).toBeNull()
  })

  test("announces the new status once it is saved", async () => {
    const { rerender } = renderButton(projectRecord(ProjectRecordEditingState.PENDING))

    fireEvent.click(screen.getByRole("button", { name: "Als abgeschlossen markieren" }))
    await waitFor(() => expect(patchProjectRecordAssignmentFn).toHaveBeenCalled())
    rerender(projectRecord(ProjectRecordEditingState.COMPLETED))

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Status: Abgeschlossen"),
    )
  })

  test("says so when the status could not be saved", async () => {
    patchProjectRecordAssignmentFn.mockRejectedValueOnce(new Error("offline"))
    renderButton(projectRecord(ProjectRecordEditingState.PENDING))

    fireEvent.click(screen.getByRole("button", { name: "Als abgeschlossen markieren" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Status konnte nicht gespeichert werden.",
    )
  })
})
