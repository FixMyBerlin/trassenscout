import Image from "next/legacy/image"
import svgLogoTrassenscout from "../assets/trassenscout-logo-gelb.svg"

type Props = { beta?: boolean }

export const NavigationGeneralLogo: React.FC<Props> = ({ beta = true }) => {
  return (
    <div className="flex items-end">
      <Image
        src={svgLogoTrassenscout}
        className="text-yellow-500"
        alt="Trassenscout"
        height={32}
        width={120}
      />
      {beta && <span className="ml-2 text-xs uppercase text-gray-400">Alpha</span>}
    </div>
  )
}
