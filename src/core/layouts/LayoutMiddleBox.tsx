import Image from "next/image"
import { EyeDropperIcon } from "@heroicons/react/24/solid"
import Head from "next/head"
import React from "react"
import { Layout } from "./Layout"
import Logo from "../layouts/Navigation/assets/trassenscout-logo.svg"

type Props = {
  title?: string
  subtitle?: string
  children: React.ReactNode
}

export const LayoutMiddleBox: React.FC<Props> = ({ title, subtitle, children }) => {
  return (
    <Layout navigation="none" footer="minimal">
      <div className="set-bg-indigo-50-on-body">
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:mx-auto sm:w-full sm:max-w-md">
            <Image src={Logo} className="" alt="Trassenscout" height={48} />

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
