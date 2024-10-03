import "@/src/app/_components/layouts/global.css"
import { clsx } from "clsx"
import { Metadata, Viewport } from "next"
import { BlitzProvider } from "../blitz-client"
import { defaultMetadata } from "./_components/layouts/defaultMetadata"
import { fontClasses } from "./_components/layouts/fonts"
import { useMatomo } from "./_components/layouts/useMatomo"
import { TailwindResponsiveHelper } from "./_components/TailwindResponsiveHelper/TailwindResponsiveHelper"

export const metadata: Metadata = defaultMetadata
export const viewport: Viewport = { themeColor: "#1f2937" }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  useMatomo()

  return (
    <html lang="de" className={clsx(fontClasses, "h-full scroll-smooth")}>
      <body className="flex min-h-full w-full flex-col text-gray-800 antialiased">
        <BlitzProvider>
          <div className="flex h-full w-full flex-none flex-grow flex-col">{children}</div>
        </BlitzProvider>
        <TailwindResponsiveHelper />
      </body>
    </html>
  )
}
