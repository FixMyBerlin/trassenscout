import svgLogoTrassenscout from "@/src/components/shared/app/layouts/assets/trassenscout-logo-gelb.svg"
import { Img } from "@/src/components/shared/Img"

type Props = { beta?: boolean }

export const NavigationGeneralLogo = ({ beta = true }: Props) => {
  return (
    <div className="flex items-end">
      <Img
        src={svgLogoTrassenscout}
        className="text-yellow-500"
        alt="Trassenscout"
        height={30}
        width={84}
        loading="eager"
      />
      {beta && <span className="ml-2 text-xs text-gray-400 uppercase">Beta</span>}
    </div>
  )
}
