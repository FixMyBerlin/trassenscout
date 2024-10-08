import { useAuthenticatedBlitzContext } from "@/src/blitz-server"
import { Metadata } from "next"

export const metadata: Metadata = {
  robots: "noindex",
  title: {
    default: "ADMIN Trassenscout",
    template: "ADMIN: %s – trassenscout.de",
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await useAuthenticatedBlitzContext({ role: ["ADMIN"], redirectTo: "/auth/login" })

  return (
    <div className="relative flex h-full flex-col bg-pink-50">
      <main className="prose prose-pink mx-auto w-full max-w-4xl py-10 prose-hr:border-white">
        <h1 className="text-pink-600">Trassenscout ADMIN</h1>
        {children}
      </main>
    </div>
  )
}
