import { XMarkIcon } from "@heroicons/react/20/solid"
import Image from "next/image"
import { Link } from "src/core/components/links"
import { ProgressBar } from "src/participation/components/layout/ProgressBar"
import Logo from "./../assets/rsv8-logo.png"

export const HeaderParticipation = () => {
  return (
    <nav className="z-20 shadow-xl">
      <div className="mx-auto flex items-center justify-between px-2 text-gray-500 sm:px-6 lg:pl-5 lg:pr-2.5">
        <div className="flex h-full items-start justify-start">
          <Image width={50} height={50} src={Logo} alt="RS-Logo" />
          <span className="py-5 pl-4">Beteiligung</span>
        </div>
        <Link
          classNameOverwrites="text-gray-900"
          href="https://radschnellweg8-lb-wn.de/beteiligung"
        >
          <XMarkIcon className="h-7  w-7" />
        </Link>
      </div>
      <ProgressBar />
    </nav>
  )
}
