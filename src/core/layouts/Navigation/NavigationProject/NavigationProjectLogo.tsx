import { BuildingLibraryIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import Image from "next/image"
import pngRsv8Logo from "./../assets/rsv8-logo.png"

export const NavigationProjectLogo: React.FC = () => {
  const regionLogo = true
  const regionlogoWhiteBackgroundRequired = false
  // TODO

  return (
    <>
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
