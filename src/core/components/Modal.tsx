import {
  consumePendingMountRelease,
  isModalCloseBlocked,
} from "@/src/core/components/Modal/modalCloseGuard"
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Fragment, useEffect } from "react"
import { twMerge } from "tailwind-merge"

type Props = {
  children?: React.ReactNode
  open: boolean
  handleClose: () => void
  className?: string
  align?: "center" | "right"
}

export const ModalCloseButton = ({ onClose }: { onClose: () => void }) => {
  return (
    <button
      type="button"
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

  // If we are being mounted as the result of a modal-to-modal navigation
  // (e.g. edit → detail), release the pending close block now that Headless
  // UI's own useDocumentEvent listeners are live. The resulting
  // SETTLE_AFTER_BLOCK_RELEASE_MS settle window protects against the spurious
  // Dialog.onClose events Headless UI fires during rapid route transitions.
  useEffect(() => {
    consumePendingMountRelease()?.()
  }, [])

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-20"
        onClose={() => {
          if (isModalCloseBlocked()) return
          handleClose()
        }}
      >
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
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                className={twMerge(
                  isRightAligned
                    ? "relative ml-auto h-dvh w-full max-w-none transform overflow-y-auto bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:w-[clamp(960px,80vw,1280px)] sm:max-w-[calc(100vw-2rem)] sm:p-6"
                    : "relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6",
                  className,
                )}
              >
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
