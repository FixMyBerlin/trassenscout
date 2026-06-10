import { Outlet } from "@tanstack/react-router"
import { FooterMinimal } from "@/src/components/shared/app/layouts/footer/FooterMinimal"

export function LayoutAuth() {
  return (
    <main className="flex min-h-full grow flex-col justify-center bg-gray-100">
      <div className="grow py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>
      <FooterMinimal />
    </main>
  )
}
