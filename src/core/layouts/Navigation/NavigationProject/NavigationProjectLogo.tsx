import { BuildingLibraryIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import Image from "next/image"
import React from "react"
import pngRsv8Logo from "./../assets/rsv8-logo.png"

export const NavigationProjectLogo: React.FC = () => {
  // const {
  //   data: { region },
  // } = useMatch<LocationGenerics>()

  // if (!region) return null

  const regionLogo = true
  const regionlogoWhiteBackgroundRequired = false
  // TODO

  return (
    <>
      {/* {region.logoPath ? (
        <div
          className={clsx({
            "rounded-sm bg-white/90 px-1 py-1": region.logoWhiteBackgroundRequired,
          })}
        >
          <img src={region.logoPath} className="h-6 w-auto" alt="" />
        </div>
      ) : (
        <>
          <BuildingLibraryIcon className="block h-8 w-auto text-yellow-400 lg:hidden" />
          <BuildingLibraryIcon className="hidden h-8 w-auto text-yellow-400 lg:block" />
        </>
      )}
      <span className={clsx("ml-2", region.logoPath ? "text-gray-400" : "text-yellow-400")}>
        Radverkehrsatlas (alpha) <span className="hidden md:inline">{region.fullName}</span>
      </span> */}
      {regionLogo ? (
        <div
          className={clsx({
            "rounded-sm bg-white/90 px-1 py-1": regionlogoWhiteBackgroundRequired,
          })}
        >
          <Image src={pngRsv8Logo} width={48} height={48} className="block h-12 w-12" alt="" />
        </div>
      ) : (
        <>
          <BuildingLibraryIcon className="block h-8 w-auto text-yellow-400 lg:hidden" />
          <BuildingLibraryIcon className="hidden h-8 w-auto text-yellow-400 lg:block" />
          {/* TODO fallback Logo? */}
        </>
      )}
    </>
  )
}
