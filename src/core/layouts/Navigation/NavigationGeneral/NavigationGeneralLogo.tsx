import Image from "next/image"
import svgLogoTrassenscout from "../assets/trassenscout-logo-weiss.svg"

export const NavigationGeneralLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <Image
        src={svgLogoTrassenscout}
        className="block h-8 w-auto text-rsv-ochre lg:hidden"
        alt="Trassenscout"
        height={32}
        width={217}
      />
      <span className="ml-2 text-xs uppercase text-gray-400">Alpha</span>
    </div>
  )
}
