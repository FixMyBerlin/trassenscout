import { XMarkIcon } from "@heroicons/react/20/solid"
import Image from "next/image"
import { ProgressBar } from "src/participation/components/core/layout/ProgressBar"
import { ParticipationLink } from "../links/ParticipationLink"

type Props = {
  logoSrc: string
  landingPageUrl: string
}

export const HeaderParticipation: React.FC<Props> = ({ logoSrc, landingPageUrl }) => {
  return (
    <nav className="z-20 shadow-xl">
      <div className="mx-auto flex items-center justify-between px-2 text-gray-500 sm:px-6 lg:pl-5 lg:pr-2.5">
        <div className="flex h-full items-start justify-start">
          <span className="relative h-12 w-12">
            <Image className="object-contain" fill src={logoSrc} alt="Projektlogo" />
          </span>
          <span className="py-5 pl-5">Beteiligung</span>
        </div>
        {/* TODO replace link in production: https://radschnellweg8-lb-wn.de/beteiligung */}
        <ParticipationLink classNameOverwrites="text-gray-900" href={landingPageUrl}>
          <XMarkIcon className="h-7  w-7" />
        </ParticipationLink>
      </div>
      <ProgressBar />
    </nav>
  )
}
