import { XMarkIcon } from "@heroicons/react/20/solid"
import { Link } from "src/core/components/links"
import { ProgressBar } from "src/participation/components/layout/ProgressBar"

type Props = {
  logoSrc: string
}

export const HeaderParticipation: React.FC<Props> = ({ logoSrc }) => {
  return (
    <nav className="z-20 shadow-xl">
      <div className="mx-auto flex items-center justify-between px-2 text-gray-500 sm:px-6 lg:pl-5 lg:pr-2.5">
        <div className="flex h-full items-start justify-start">
          <img className="h-8 w-8" src={logoSrc} />
          <span className="py-5 pl-5">Beteiligung</span>
        </div>
        {/* TODO replace link in production: https://radschnellweg8-lb-wn.de/beteiligung */}
        <Link
          classNameOverwrites="text-gray-900"
          href="https://develop--rsv8-lb-wn.netlify.app/beteiligung/"
        >
          <XMarkIcon className="h-7  w-7" />
        </Link>
      </div>
      <ProgressBar />
    </nav>
  )
}
