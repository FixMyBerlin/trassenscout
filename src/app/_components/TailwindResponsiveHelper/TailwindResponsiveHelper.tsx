import { Tooltip } from "@/src/core/components/Tooltip/Tooltip"
import { isDev } from "@/src/core/utils/isEnv"

export const TailwindResponsiveHelper = () => {
  if (!isDev) return null

  return (
    <a
      className="border-xl fixed bottom-1 left-1 z-50 flex h-5 flex-row items-center space-x-1 rounded-sm bg-gray-900 px-1 text-xs text-white shadow-2xl hover:underline print:hidden"
      href="https://tailwindcss.com/docs/responsive-design"
    >
      <Tooltip content="<640px">
        <span className="text-white">–</span>
      </Tooltip>
      <Tooltip content="640px">
        <span className="text-white/20 sm:text-white">sm</span>
      </Tooltip>
      <Tooltip content="768px">
        <span className="text-white/20 md:text-white">md</span>
      </Tooltip>
      <Tooltip content="1024px">
        <span className="text-white/20 lg:text-white">lg</span>
      </Tooltip>
      <Tooltip content="1280px">
        <span className="text-white/20 xl:text-white">xl</span>
      </Tooltip>
      <Tooltip content="1536px">
        <span className="text-white/20 2xl:text-white">2xl</span>
      </Tooltip>
    </a>
  )
}
