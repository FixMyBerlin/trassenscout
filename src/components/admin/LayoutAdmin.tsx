import { Outlet } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminSidebar } from "@/src/components/admin/AdminSidebar"
import { Spinner } from "@/src/components/core/components/Spinner"
import { appShellRowClassName } from "@/src/components/shared/layouts/layoutClasses"

export function LayoutAdmin() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <div className={appShellRowClassName}>
        <Suspense
          fallback={
            <div className="flex w-72 shrink-0 items-center justify-center bg-purple-700">
              <Spinner />
            </div>
          }
        >
          <AdminSidebar />
        </Suspense>
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex flex-1 flex-col bg-gray-50 pb-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
