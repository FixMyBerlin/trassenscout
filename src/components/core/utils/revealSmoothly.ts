const REVEAL_DURATION_MS = 250

/** Nearest ancestor that scrolls vertically — a modal's panel, or else the page. */
function verticalScrollContainer(node: HTMLElement) {
  for (let element = node.parentElement; element; element = element.parentElement) {
    const { overflowY } = getComputedStyle(element)
    const canScroll = overflowY === "auto" || overflowY === "scroll"
    if (canScroll && element.scrollHeight > element.clientHeight) return element
  }
  return document.scrollingElement ?? document.documentElement
}

/** Returns a cancel function, which a React ref callback can return as its cleanup. */
export function revealSmoothly(node: HTMLElement) {
  const container = verticalScrollContainer(node)
  const isPage = container === document.scrollingElement || container === document.documentElement
  const containerView = isPage
    ? { top: 0, bottom: window.innerHeight }
    : container.getBoundingClientRect()
  const visual = window.visualViewport
  const view = {
    top: Math.max(containerView.top, visual ? visual.offsetTop : -Infinity),
    bottom: Math.min(containerView.bottom, visual ? visual.offsetTop + visual.height : Infinity),
  }
  const { top, bottom } = node.getBoundingClientRect()
  const distance = bottom > view.bottom ? bottom - view.bottom : top < view.top ? top - view.top : 0
  const nothingToCancel = () => {}
  if (distance === 0) return nothingToCancel

  const scrollToOffset = (offset: number) =>
    container.scrollTo({ top: offset, behavior: "instant" })
  const start = container.scrollTop
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scrollToOffset(start + distance)
    return nothingToCancel
  }

  const startTime = performance.now()
  let expected = start
  let frame = 0
  const step = (now: number) => {
    if (Math.abs(container.scrollTop - expected) > 1) return
    const progress = Math.min(1, Math.max(0, (now - startTime) / REVEAL_DURATION_MS))
    expected = start + distance * (1 - (1 - progress) ** 3)
    scrollToOffset(expected)
    if (progress < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
  return () => cancelAnimationFrame(frame)
}
