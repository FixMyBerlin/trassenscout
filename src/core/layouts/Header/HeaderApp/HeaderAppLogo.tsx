import { ChatBubbleBottomCenterIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/20/solid"
import { MapIcon } from "@heroicons/react/24/outline"
import React from "react"

export const HeaderAppLogo: React.FC = () => {
  return (
    <>
      <ChatBubbleOvalLeftIcon className="block h-8 w-auto text-yellow-400 lg:hidden" />
      <ChatBubbleOvalLeftIcon className="hidden h-8 w-auto text-yellow-400 lg:block" />{" "}
      <span className="ml-2 text-gray-400">TrassenScout - Abstimmungsplattform</span>
    </>
  )
}
