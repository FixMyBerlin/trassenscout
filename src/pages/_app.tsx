import { AppProps, ErrorBoundary, ErrorComponent, ErrorFallbackProps } from "@blitzjs/next"
// https://fontsource.org/fonts/red-hat-text/install => Tab "Static"
import "@/src/app/_components/layouts/global.css"
import { withBlitz } from "@/src/blitz-client"
import { init } from "@socialgouv/matomo-next"
import { AuthenticationError, AuthorizationError } from "blitz"
import { Suspense, useEffect, useRef } from "react"
import { fontRedHatText } from "../app/_components/layouts/fonts"

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID

function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error.message || error.name}
      />
    )
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const matomoInitialized = useRef(false)

  useEffect(() => {
    if (MATOMO_URL && MATOMO_SITE_ID && matomoInitialized.current === false) {
      init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
    }
    return () => {
      matomoInitialized.current = true
    }
  }, [])

  const getLayout = Component.getLayout || ((page) => page)

  return (
    <>
      {/* This is a work around because adding the font family variable does not work for unkown reasons. The variable is set but TW does not recognize it "variable not defined" */}
      <style jsx global>{`
        html {
          font-family: ${fontRedHatText.style.fontFamily}};
        }
      `}</style>
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        <Suspense>{getLayout(<Component {...pageProps} />)}</Suspense>
      </ErrorBoundary>
    </>
  )
}

export default withBlitz(MyApp)
