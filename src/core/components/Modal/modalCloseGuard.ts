let activeModalCloseBlocks = 0
let settleUntilMs = 0

const SETTLE_AFTER_BLOCK_RELEASE_MS = 1200
const PENDING_MOUNT_RELEASE_MAX_WAIT_MS = 3000

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

/**
 * Holds the modal close block open until the next modal mounts.
 *
 * Call this before navigating from one modal to another (e.g. edit → detail).
 * The incoming Modal component will consume and release the block in its
 * useEffect (i.e. after mount + Headless UI's own listeners are live),
 * which starts the normal SETTLE_AFTER_BLOCK_RELEASE_MS settle window.
 * This prevents the spurious Dialog.onClose that Headless UI fires during
 * rapid route transitions from closing the newly mounted modal.
 */
export const blockUntilModalMounts = () => {
  // Replace any stale pending release to avoid leaking a permanent close block
  // when no modal ends up mounting (e.g. modal → page navigations).
  consumePendingMountRelease()?.()

  const release = beginModalCloseBlock()
  pendingMountRelease = release
  pendingMountReleaseTimeout = setTimeout(() => {
    consumePendingMountRelease()?.()
  }, PENDING_MOUNT_RELEASE_MAX_WAIT_MS)
}

let pendingMountRelease: (() => void) | null = null
let pendingMountReleaseTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Consume and return the pending mount release set by blockUntilModalMounts(),
 * or null if none is pending. Should be called exactly once per Modal mount.
 */
export const consumePendingMountRelease = (): (() => void) | null => {
  if (pendingMountReleaseTimeout) {
    clearTimeout(pendingMountReleaseTimeout)
    pendingMountReleaseTimeout = null
  }

  const release = pendingMountRelease
  pendingMountRelease = null
  return release
}
