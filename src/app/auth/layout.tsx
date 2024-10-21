import { FooterMinimal } from "../_components/layouts/footer/FooterMinimal"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-full flex-grow flex-col justify-center bg-gray-100">
      <div className="flex-grow py-12 sm:px-6 lg:px-8">{children}</div>
      <FooterMinimal />
    </main>
  )
}
