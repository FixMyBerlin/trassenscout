let activeModalCloseBlocks = 0
let settleUntilMs = 0

const SETTLE_AFTER_BLOCK_RELEASE_MS = 1200

export const beginModalCloseBlock = () => {
  activeModalCloseBlocks += 1
  let released = false

  return () => {
    if (released) return
    released = true
    activeModalCloseBlocks = Math.max(0, activeModalCloseBlocks - 1)
    settleUntilMs = Date.now() + SETTLE_AFTER_BLOCK_RELEASE_MS
  }
}

export const isModalCloseBlocked = () => {
  return activeModalCloseBlocks > 0 || Date.now() < settleUntilMs
}

