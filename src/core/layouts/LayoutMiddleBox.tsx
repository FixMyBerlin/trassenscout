import { EyeDropperIcon } from "@heroicons/react/24/solid"
import Head from "next/head"
import React from "react"
import { Layout } from "./Layout"
import { Logo } from "./Logo"

type Props = {
  title?: string
  subtitle?: string
  children: React.ReactNode
}

export const LayoutMiddleBox: React.FC<Props> = ({ title, subtitle, children }) => {
  return (
    <Layout navigation={false}>
      <div className="set-bg-indigo-50-on-body">
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Logo />

            {Boolean(title) && (
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                {title}
              </h2>
            )}
            {Boolean(subtitle) && (
              <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">{children}</div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
