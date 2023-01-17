import { BlitzPage } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { useEffect } from "react"
import logout from "src/auth/mutations/logout"
import { buttonStyles } from "src/core/components/links"
import { LayoutMiddleBox, MetaTags } from "src/core/layouts"

const LogoutRedirectPage: BlitzPage = () => {
  const [logoutMutation] = useMutation(logout)
  const router = useRouter()

  const handleLogout = async () => {
    await logoutMutation()
    const next = router.query.next ? decodeURIComponent(router.query.next as string) : "/"
    return router.push(next)
  }

  useEffect(() => {
    const asyncawaitLogout = async () => await handleLogout()
    void asyncawaitLogout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LayoutMiddleBox title="Abmelden" subtitle="Sie werden abgemeldet…">
      <MetaTags noindex title="Abmelden" />
      <p className="text-center">
        <button
          className={buttonStyles}
          onClick={async () => {
            await handleLogout()
          }}
        >
          Abmelden
        </button>
      </p>
    </LayoutMiddleBox>
  )
}

LogoutRedirectPage.authenticate = true

export default LogoutRedirectPage
