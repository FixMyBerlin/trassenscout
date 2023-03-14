import Image from "next/image"
import svgLogoTrassenscout from "../assets/trassenscout-logo-gelb.svg"

export const NavigationGeneralLogo: React.FC = () => {
  return (
    <div className="flex items-end">
      <Image
        src={svgLogoTrassenscout}
        className="text-yellow-500 block h-8 w-auto lg:hidden"
        alt="Trassenscout"
        height={32}
        width={120}
      />
      <span className="ml-2 text-xs uppercase text-gray-400">Alpha</span>
    </div>
  )
}
