import { EyeDropperIcon } from "@heroicons/react/20/solid"

export const HeaderAppLogo: React.FC = () => {
  return (
    <>
      <EyeDropperIcon className="block h-8 w-auto text-yellow-400 lg:hidden" />
      <EyeDropperIcon className="hidden h-8 w-auto text-yellow-400 lg:block" />{" "}
      <span className="ml-2 text-gray-400">TrassenScout - Abstimmungsplattform</span>
    </>
  )
}
