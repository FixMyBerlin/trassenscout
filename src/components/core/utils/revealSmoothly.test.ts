// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { revealSmoothly } from "./revealSmoothly"

// jsdom has no layout or animation frames, so geometry, scrolling and frames are played by hand.
let frames = new Map<number, FrameRequestCallback>()
let nextFrameId = 0
let now = 0
const nextFrame = () => {
  const [id, callback] = frames.entries().next().value!
  frames.delete(id)
  callback((now += 16))
}
const runFrames = () => {
  while (frames.size > 0) nextFrame()
}

/** A 400px tall panel scrolling 1000px of content, like the record modal's. */
function panelWithNodeAt(nodeTop: number) {
  const panel = document.createElement("div")
  panel.style.overflowY = "auto"
  let scrollTop = 0
  Object.defineProperties(panel, {
    scrollHeight: { value: 1000 },
    clientHeight: { value: 400 },
    scrollTop: { get: () => scrollTop, set: (value: number) => (scrollTop = value) },
  })
  panel.getBoundingClientRect = () => ({ top: 0, bottom: 400 }) as DOMRect
  const scrollTo = vi.fn((options: ScrollToOptions) => (scrollTop = options.top ?? scrollTop))
  panel.scrollTo = scrollTo as unknown as typeof panel.scrollTo
  const node = document.createElement("div")
  node.getBoundingClientRect = () =>
    ({ top: nodeTop - scrollTop, bottom: nodeTop - scrollTop }) as DOMRect
  panel.append(node)
  document.body.append(panel)
  return { panel, node, scrollTo }
}

describe("revealSmoothly", () => {
  let prefersReducedMotion = false
  beforeEach(() => {
    frames = new Map()
    now = 0
    prefersReducedMotion = false
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.set(++nextFrameId, callback)
      return nextFrameId
    })
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id))
    vi.spyOn(performance, "now").mockImplementation(() => now)
    vi.stubGlobal("matchMedia", () => ({ matches: prefersReducedMotion }))
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.body.innerHTML = ""
  })

  test("eases the panel just far enough to show a node below its bottom edge", () => {
    const { panel, node } = panelWithNodeAt(450)

    revealSmoothly(node)
    nextFrame()
    const afterFirstFrame = panel.scrollTop
    runFrames()

    expect(afterFirstFrame).toBeGreaterThan(0)
    expect(afterFirstFrame).toBeLessThan(50)
    expect(panel.scrollTop).toBeCloseTo(50)
  })

  test("leaves the panel alone when the node is already visible", () => {
    const { panel, node } = panelWithNodeAt(200)

    revealSmoothly(node)

    expect(frames.size).toBe(0)
    expect(panel.scrollTop).toBe(0)
  })

  test("jumps straight there for people who prefer reduced motion", () => {
    prefersReducedMotion = true
    const { panel, node } = panelWithNodeAt(450)

    revealSmoothly(node)

    expect(frames.size).toBe(0)
    expect(panel.scrollTop).toBe(50)
  })

  test("steps instantly, so the page's CSS smooth scrolling cannot slow the steps down", () => {
    const { node, scrollTo } = panelWithNodeAt(450)

    revealSmoothly(node)
    runFrames()

    expect(scrollTo.mock.calls.length).toBeGreaterThan(1)
    expect(scrollTo.mock.calls.every(([options]) => options.behavior === "instant")).toBe(true)
  })

  test("stops when something else scrolls the panel, instead of fighting it", () => {
    const { panel, node } = panelWithNodeAt(450)

    revealSmoothly(node)
    nextFrame()
    panel.scrollTop = 0 // the user scrolls back up mid-animation
    runFrames()

    expect(panel.scrollTop).toBe(0)
  })

  test("stops a reveal under way when cancelled, e.g. because the button went away", () => {
    const { panel, node } = panelWithNodeAt(450)

    const cancel = revealSmoothly(node)
    nextFrame()
    const afterFirstFrame = panel.scrollTop
    cancel()
    runFrames()

    expect(panel.scrollTop).toBe(afterFirstFrame)
  })

  test("counts what the on-screen keyboard covers as out of view", () => {
    vi.stubGlobal("visualViewport", { offsetTop: 0, height: 300 })
    const { panel, node } = panelWithNodeAt(350) // inside the panel, but under the keyboard

    revealSmoothly(node)
    runFrames()

    expect(panel.scrollTop).toBeCloseTo(50)
  })
})
