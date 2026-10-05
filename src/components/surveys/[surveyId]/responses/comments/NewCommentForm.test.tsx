// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { revealSmoothly } from "@/src/components/core/utils/revealSmoothly"
import { NewCommentForm } from "./NewCommentForm"

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  // FormShell only reads the pathname; both real hosts are project pages, not admin ones.
  useLocation: () => ({ pathname: "/ohv/project-records" }),
}))

vi.mock("@/src/components/core/utils/revealSmoothly", () => ({ revealSmoothly: vi.fn() }))

const buttonName = "Anmerkung hinzufügen"

describe("NewCommentForm", () => {
  const cancelReveal = vi.fn()
  beforeEach(() => {
    cancelReveal.mockClear()
    vi.mocked(revealSmoothly).mockClear().mockReturnValue(cancelReveal)
  })

  test("shows the button only once there is text, and brings it into view once", async () => {
    const { rerender } = render(<NewCommentForm commentLabel="Anmerkung" createComment={vi.fn()} />)
    const textarea = screen.getByRole("textbox")

    expect(screen.queryByRole("button", { name: buttonName })).toBeNull()

    fireEvent.change(textarea, { target: { value: "   " } })
    expect(screen.queryByRole("button", { name: buttonName })).toBeNull()

    textarea.focus()
    fireEvent.change(textarea, { target: { value: "Rückruf am Montag" } })
    expect(await screen.findByRole("button", { name: buttonName })).toBeInTheDocument()
    // Showing the button must not rebuild the field: same node, still focused.
    expect(screen.getByRole("textbox")).toBe(textarea)
    expect(textarea).toHaveFocus()
    expect(revealSmoothly).toHaveBeenCalledTimes(1)
    expect(revealSmoothly).toHaveBeenCalledWith(expect.any(HTMLDivElement))

    fireEvent.change(textarea, { target: { value: "Rückruf am Montag, 10 Uhr" } })
    expect(revealSmoothly).toHaveBeenCalledTimes(1)

    // A parent re-render (e.g. the list refetching) must not scroll the page again.
    rerender(<NewCommentForm commentLabel="Anmerkung" createComment={vi.fn()} />)
    expect(revealSmoothly).toHaveBeenCalledTimes(1)
  })

  test("hides the button again after the comment is added, cancelling its reveal", async () => {
    const createComment = vi.fn()
    render(<NewCommentForm commentLabel="Anmerkung" createComment={createComment} />)

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Rückruf am Montag" } })
    fireEvent.click(await screen.findByRole("button", { name: buttonName }))

    await waitFor(() => expect(createComment).toHaveBeenCalledWith("Rückruf am Montag"))
    await waitFor(() => expect(screen.queryByRole("button", { name: buttonName })).toBeNull())
    expect(screen.getByRole("textbox")).toHaveValue("")
    expect(cancelReveal).toHaveBeenCalledTimes(1)
  })
})
