import "@/src/app/_components/layouts/global.css"
import { clsx } from "clsx"
import { Metadata, Viewport } from "next"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Suspense } from "react"
import { BlitzProvider } from "../blitz-client"
import { defaultMetadata } from "./_components/layouts/defaultMetadata"
import { fontClasses } from "./_components/layouts/fonts"
import { TailwindResponsiveHelper } from "./_components/TailwindResponsiveHelper/TailwindResponsiveHelper"

export const metadata: Metadata = defaultMetadata
export const viewport: Viewport = { themeColor: "#1f2937" }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // useMatomo()

  return (
    <html lang="de" className={clsx(fontClasses, "h-full scroll-smooth")}>
      <body className="flex min-h-full w-full flex-col bg-white text-gray-800 antialiased">
        <BlitzProvider>
          <NuqsAdapter>
            <Suspense>
              <div className="flex h-full w-full flex-none grow flex-col">{children}</div>
            </Suspense>
          </NuqsAdapter>
        </BlitzProvider>
        <TailwindResponsiveHelper />
      </body>
    </html>
  )
}
