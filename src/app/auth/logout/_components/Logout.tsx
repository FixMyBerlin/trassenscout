"use client"
import logout from "@/src/server/auth/mutations/logout"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const Logout = () => {
  const [logoutMutation] = useMutation(logout)
  const router = useRouter()

  const handleLogout = async () => {
    await logoutMutation()
    router.push("/")
  }

  useEffect(() => {
    const asyncawaitLogout = async () => await handleLogout()
    void asyncawaitLogout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
