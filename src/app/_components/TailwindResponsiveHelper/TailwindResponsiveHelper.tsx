import { isDev } from "@/src/core/utils/isEnv"

export const TailwindResponsiveHelper = () => {
  if (!isDev) return null

  return (
    <a
      className="border-xl fixed bottom-1 left-1 z-50 flex h-5 flex-row items-center space-x-1 rounded-sm bg-gray-900 px-1 text-xs text-white shadow-2xl hover:underline print:hidden"
      href="https://tailwindcss.com/docs/responsive-design"
    >
      <span className="text-white" title="<640px">
        –
      </span>
      <span className="text-white/20 sm:text-white" title="640px">
        sm
      </span>
      <span className="text-white/20 md:text-white" title="768px">
        md
      </span>
      <span className="text-white/20 lg:text-white" title="1024px">
        lg
      </span>
      <span className="text-white/20 xl:text-white" title="1280px">
        xl
      </span>
      <span className="text-white/20 2xl:text-white" title="1536px">
        2xl
      </span>
    </a>
  )
}
