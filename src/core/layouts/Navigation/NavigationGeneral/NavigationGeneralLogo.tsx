import { EyeDropperIcon } from "@heroicons/react/20/solid"

export const NavigationGeneralLogo: React.FC = () => {
  return (
    <>
      <EyeDropperIcon className="block h-8 w-auto text-rsv-ochre lg:hidden" />
      <EyeDropperIcon className="hidden h-8 w-auto text-rsv-ochre lg:block" />{" "}
      <span className="ml-2 text-gray-400">Trassenscout (Alpha)</span>
    </>
  )
}
