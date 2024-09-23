import { useAuthenticatedBlitzContext } from "@/src/blitz-server"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await useAuthenticatedBlitzContext({ role: ["admin"], redirectTo: "/auth/login" })

  return (
    <div className="relative flex h-full flex-col overflow-x-hidden">
      <h1>Trassenscout Admin-Bereich</h1>
      <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
    </div>
  )
}
