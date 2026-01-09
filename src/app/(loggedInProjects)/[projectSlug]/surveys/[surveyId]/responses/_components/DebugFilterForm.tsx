import { isDev } from "@/src/core/utils/isEnv"

export const DebugFilterForm = ({ filter }: { filter: any }) => {
  if (isDev)
    return (
      <pre className="width-120 fixed top-12 right-2 z-50 max-h-80 overflow-scroll bg-pink-100 text-xs text-pink-600">
        {JSON.stringify(filter, undefined, 2)}
      </pre>
    )

  return null
}
