import React from "react"
import { Disclosure as HeadlessUiDisclosure, Transition } from "@headlessui/react"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

type Props = {
  button: React.ReactNode | string
  children?: React.ReactNode | string
  classNameButton?: string
  classNamePanel?: string
}

export const Disclosure: React.FC<Props> = ({
  button,
  children,
  classNameButton,
  classNamePanel,
}) => {
  if (!children) return <div>{button}</div>

  return (
    <HeadlessUiDisclosure>
      {({ open }) => (
        <>
          <HeadlessUiDisclosure.Button
            className={clsx(
              classNameButton,
              "group flex w-full items-center justify-between focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
            )}
          >
            {button}

            {open ? (
              <ChevronUpIcon className="h-3 w-3 text-gray-700 group-hover:text-black" />
            ) : (
              <ChevronDownIcon className="h-3 w-3 text-gray-700 group-hover:text-black" />
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
            {/* Termin - ausgeklappt / zusätzliche Info */}
            <HeadlessUiDisclosure.Panel static className={clsx(classNamePanel, "overflow-clip")}>
              {children}
            </HeadlessUiDisclosure.Panel>
          </Transition>
        </>
      )}
    </HeadlessUiDisclosure>
  )
}
