import svgLogoTrassenscout from "@/src/app/_components/layouts/assets/trassenscout-logo-gelb.svg"
import Image from "next/image"

type Props = { beta?: boolean }

export const NavigationGeneralLogo = ({ beta = true }: Props) => {
  return (
    <div className="flex items-end">
      <Image
        src={svgLogoTrassenscout}
        className="text-yellow-500"
        alt="Trassenscout"
        height={30}
        width={84}
      />
      {beta && <span className="ml-2 text-xs text-gray-400 uppercase">Beta</span>}
    </div>
  )
}
