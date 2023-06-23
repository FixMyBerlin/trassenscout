import { Disclosure as HeadlessUiDisclosure, Transition } from "@headlessui/react"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import React from "react"

type Props = {
  button: React.ReactNode | string
  children?: React.ReactNode | string
  classNameButton?: string
  classNamePanel?: string
  onOpen?: () => void
  onClose?: () => void
  open?: boolean
}

export const Disclosure: React.FC<Props> = ({
  button,
  children,
  classNameButton,
  classNamePanel,
  onOpen,
  onClose,
  open = false,
}) => {
  if (!children) return <div>{button}</div>

  return (
    <HeadlessUiDisclosure defaultOpen={open}>
      {({ open }) => (
        <>
          <HeadlessUiDisclosure.Button
            className={clsx(
              classNameButton,
              "group flex w-full items-center justify-between pr-4 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 sm:pr-6",
              { "border-b border-gray-100": !open }
            )}
            onClick={() => {
              open && onClose && onClose()
              !open && onOpen && onOpen()
            }}
          >
            {button}

            {open ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-700 group-hover:text-black" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-700 group-hover:text-black" />
            )}
          </HeadlessUiDisclosure.Button>
          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            {/* ausgeklappt / zusätzliche Info */}
            <HeadlessUiDisclosure.Panel
              static
              className={clsx(classNamePanel, "overflow-clip", {
                "border-b border-gray-100": open,
              })}
            >
              {children}
            </HeadlessUiDisclosure.Panel>
          </Transition>
        </>
      )}
    </HeadlessUiDisclosure>
  )
}
