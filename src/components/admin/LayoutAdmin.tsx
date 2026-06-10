import { Outlet } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminSidebar } from "@/src/components/admin/AdminSidebar"
import { Spinner } from "@/src/components/core/components/Spinner"

export function LayoutAdmin() {
  return (
    <div className="flex min-h-dvh bg-gray-50">
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
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col bg-gray-50 px-6 pb-10 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
