import { isDev } from "@/src/components/core/utils/isEnv"

export const DebugFilterForm = ({ filter }: { filter: any }) => {
  if (isDev)
    return (
      <details className="fixed top-12 right-2 z-50 w-[28rem] max-w-[calc(100vw-1rem)] rounded-sm border border-pink-300 bg-pink-100 text-xs text-pink-700 shadow-lg">
        <summary className="cursor-pointer px-3 py-2 font-medium select-none">Filter-Debug</summary>
        <pre className="max-h-[60vh] overflow-auto border-t border-pink-300 px-3 py-2">
          {JSON.stringify(filter, undefined, 2)}
        </pre>
      </details>
    )

  return null
}
