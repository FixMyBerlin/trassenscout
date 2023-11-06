import { XMarkIcon } from "@heroicons/react/20/solid"
import Image from "next/image"

import { ParticipationLink } from "../core/links/ParticipationLink"
import { ProgressBar } from "./ProgressBar"

type Props = {
  logoSrc: string
}

export const HeaderParticipation: React.FC<Props> = ({ logoSrc }) => {
  return (
    <nav className="z-20 shadow-xl">
      <div className="mx-auto flex items-center justify-between px-2 text-gray-500 sm:px-6 lg:pl-5 lg:pr-2.5">
        <div className="flex h-full items-start justify-start">
          <span className="relative h-12 w-12">
            <Image className="object-contain" fill src={logoSrc} alt="Projektlogo" />
          </span>
          <span className="py-5 pl-5">Beteiligung FRM7</span>
        </div>
        {/* TODO replace link in production: https://radschnellweg8-lb-wn.de/beteiligung */}
        <ParticipationLink
          classNameOverwrites="text-gray-900"
          href="https://develop--rsv8-lb-wn.netlify.app/beteiligung/" // todo
        >
          <XMarkIcon className="h-7  w-7" />
        </ParticipationLink>
      </div>
      <ProgressBar />
    </nav>
  )
}
