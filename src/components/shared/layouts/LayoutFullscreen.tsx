import { Outlet } from "@tanstack/react-router"

export function LayoutFullscreen() {
  return (
    <div className="h-dvh w-full overflow-hidden">
      <Outlet />
    </div>
  )
}
