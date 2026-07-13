/** Fallback for `ssr: 'data-only'` routes (map/canvas-heavy) during SSR. */
export function RouteMapShellPending() {
  return (
    <div
      className="flex min-h-[min(100dvh,800px)] w-full flex-1 items-center justify-center bg-white"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm text-gray-600">Wird geladen…</p>
    </div>
  )
}
