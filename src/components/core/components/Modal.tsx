import { Dialog, DialogPanel, Portal, TransitionChild } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { createContext, Fragment, useCallback, useContext, useEffect, useRef } from "react"
import { twMerge } from "tailwind-merge"
import { isModalCloseBlocked } from "@/src/components/core/components/Modal/modalCloseGuard"

type Props = {
  children?: React.ReactNode
  open: boolean
  handleClose: () => void
  className?: string
  align?: "center" | "right"
}

const BASE_MODAL_Z_INDEX = 20
const MODAL_Z_INDEX_STEP = 10

// Nesting depth of the current React subtree: 0 = not inside any modal, 1 = a
// top-level modal, 2 = a modal opened from inside a top-level modal, … React
// context propagates through portals (by React tree, not DOM), so a modal
// rendered into document.body still inherits its opener's depth.
const ModalDepthContext = createContext(0)

/** Depth of the nearest enclosing modal (0 when not inside one). */
const useModalDepth = () => useContext(ModalDepthContext)

/**
 * True when the calling component is rendered inside a <Modal>. Trigger
 * components use this to open a self-contained (local) modal that stacks on top,
 * instead of a URL-hosted modal that would navigate and collapse the parent.
 */
export const useIsInsideModal = () => useModalDepth() > 0

const ModalInitialFocusContext = createContext<((element: HTMLElement | null) => void) | null>(null)
let activeScrollLocks = 0
let scrollLockSnapshot:
  | {
      scrollX: number
      scrollY: number
      bodyStyle: {
        position: string
        top: string
        left: string
        right: string
        width: string
        overflowY: string
      }
    }
  | undefined

const lockWindowScroll = () => {
  activeScrollLocks += 1

  if (activeScrollLocks === 1) {
    const body = document.body
    scrollLockSnapshot = {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      bodyStyle: {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        overflowY: body.style.overflowY,
      },
    }

    body.style.position = "fixed"
    body.style.top = `-${scrollLockSnapshot.scrollY}px`
    body.style.left = `-${scrollLockSnapshot.scrollX}px`
    body.style.right = "0"
    body.style.width = "100%"
    body.style.overflowY = "scroll"
  }

  return () => {
    activeScrollLocks = Math.max(0, activeScrollLocks - 1)
    if (activeScrollLocks > 0 || !scrollLockSnapshot) return

    const body = document.body
    const root = document.documentElement
    const { bodyStyle, scrollX, scrollY } = scrollLockSnapshot
    const previousScrollBehavior = root.style.scrollBehavior

    body.style.position = bodyStyle.position
    body.style.top = bodyStyle.top
    body.style.left = bodyStyle.left
    body.style.right = bodyStyle.right
    body.style.width = bodyStyle.width
    body.style.overflowY = bodyStyle.overflowY
    root.style.scrollBehavior = "auto"
    window.scrollTo(scrollX, scrollY)
    root.style.scrollBehavior = previousScrollBehavior
    scrollLockSnapshot = undefined
  }
}

export const ModalCloseButton = ({ onClose }: { onClose: () => void }) => {
  const registerInitialFocus = useContext(ModalInitialFocusContext)

  return (
    <button
      type="button"
      ref={registerInitialFocus}
      onClick={onClose}
      className="text-gray-400 hover:cursor-pointer hover:text-gray-500 focus:outline-hidden"
      aria-label="Schließen"
    >
      <span className="sr-only">Schließen</span>
      <XMarkIcon className="size-6" />
    </button>
  )
}

export const Modal = ({ children, open, handleClose, className, align = "center" }: Props) => {
  const isRightAligned = align === "right"
  const depth = useModalDepth() + 1
  const zIndex = BASE_MODAL_Z_INDEX + depth * MODAL_Z_INDEX_STEP
  const initialFocusRef = useRef<HTMLElement | null>(null)
  const registerInitialFocus = useCallback((element: HTMLElement | null) => {
    initialFocusRef.current = element
  }, [])

  useEffect(
    function lockScrollWhileModalIsOpen() {
      if (!open) return

      const unlockScroll = lockWindowScroll()
      return function unlockScrollAfterModalClose() {
        unlockScroll()
      }
    },
    [open],
  )

  return (
    <ModalDepthContext.Provider value={depth}>
      <Portal>
        <Dialog
          open={open}
          autoFocus={false}
          initialFocus={initialFocusRef}
          as="div"
          className="relative"
          style={{ zIndex }}
          onClose={() => {
            if (isModalCloseBlocked()) return
            handleClose()
          }}
        >
          <ModalInitialFocusContext.Provider value={registerInitialFocus}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
            </TransitionChild>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div
                className={twMerge(
                  "flex min-h-full text-center",
                  isRightAligned
                    ? "items-stretch justify-end p-0"
                    : "items-end justify-center p-4 sm:items-center sm:p-0",
                )}
              >
                <TransitionChild
                  as={Fragment}
                  enter={isRightAligned ? "ease-out duration-250" : "ease-out duration-300"}
                  enterFrom={
                    isRightAligned
                      ? "opacity-0 translate-x-8 sm:translate-x-12"
                      : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  }
                  enterTo={
                    isRightAligned
                      ? "opacity-100 translate-x-0"
                      : "opacity-100 translate-y-0 sm:scale-100"
                  }
                  leave={isRightAligned ? "ease-in duration-200" : "ease-in duration-200"}
                  leaveFrom={
                    isRightAligned
                      ? "opacity-100 translate-x-0"
                      : "opacity-100 translate-y-0 sm:scale-100"
                  }
                  leaveTo={
                    isRightAligned
                      ? "opacity-0 translate-x-8 sm:translate-x-12"
                      : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  }
                >
                  <DialogPanel
                    className={twMerge(
                      isRightAligned
                        ? "relative ml-auto h-dvh w-full max-w-none overflow-y-auto bg-white text-left shadow-xl transition-all sm:w-[clamp(960px,80vw,1280px)] sm:max-w-[calc(100vw-2rem)]"
                        : "relative overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm",
                      className,
                    )}
                  >
                    {children}
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </ModalInitialFocusContext.Provider>
        </Dialog>
      </Portal>
    </ModalDepthContext.Provider>
  )
}
