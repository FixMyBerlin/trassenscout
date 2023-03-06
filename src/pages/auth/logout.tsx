import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { useEffect } from "react"
import logout from "src/auth/mutations/logout"
import { Spinner } from "src/core/components/Spinner"
import { LayoutMiddleBox, MetaTags } from "src/core/layouts"

const LogoutRedirectPage: BlitzPage = () => {
  const [logoutMutation] = useMutation(logout)
  const router = useRouter()

  const handleLogout = async () => {
    await logoutMutation()
    void router.push(Routes.Home())
  }

  useEffect(() => {
    const asyncawaitLogout = async () => await handleLogout()
    void asyncawaitLogout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LayoutMiddleBox title="Abmelden" subtitle="Sie werden abgemeldet…">
      <MetaTags noindex title="Abmelden" />
      <Spinner page />
    </LayoutMiddleBox>
  )
}

LogoutRedirectPage.authenticate = true

export default LogoutRedirectPage
