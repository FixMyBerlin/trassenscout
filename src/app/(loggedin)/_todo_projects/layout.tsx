import { FooterProject } from "../../_components/layouts/footer/FooterProject"
import { NavigationLoggedInProject } from "../../_components/layouts/navigation/NavigationLoggedInProject"

export default async function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative flex h-full flex-col overflow-x-hidden">
        <NavigationLoggedInProject />
        <main className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-8">{children}</main>
      </div>
      <FooterProject />
    </>
  )
}
