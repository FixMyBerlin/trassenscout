"use client"

// we added "use client" to the existing Markdown component to easily use this component in the app dir / server components
// Later optimization: we should consider using ServerMarkdown for static content

import { clsx } from "clsx"
import { Remark } from "react-remark"
import { Link } from "../links/Link"
import { proseClasses } from "../text"

type Props = {
  markdown?: string | null
  className?: string
}

const MdH1 = (props: any) => (
  <p className="text-base">
    <strong {...props} />
  </p>
)
const MdH2 = (props: any) => (
  <p className="text-sm">
    <strong {...props} />
  </p>
)
const MdH3 = (props: any) => (
  <p className="text-sm">
    <strong {...props} />
  </p>
)
const MdH4 = (props: any) => (
  <p className="text-sm">
    <strong {...props} />
  </p>
)
const MdH5 = (props: any) => (
  <p className="text-sm">
    <strong {...props} />
  </p>
)
const MdH6 = (props: any) => (
  <p className="text-sm">
    <strong {...props} />
  </p>
)
const MdA = (props: any) => <Link blank to={props.href} {...props} />

const components = {
  h1: MdH1,
  h2: MdH2,
  h3: MdH3,
  h4: MdH4,
  h5: MdH5,
  h6: MdH6,
  a: MdA,
}

const autoLinkUrls = (text: string): string => {
  // First, protect existing markdown links by temporarily replacing them
  const markdownLinks: string[] = []
  const placeholder = "___MARKDOWN_LINK___"

  // Match and store all existing markdown links [text](url)
  let textWithPlaceholders = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match) => {
    markdownLinks.push(match)
    return `${placeholder}${markdownLinks.length - 1}${placeholder}`
  })

  // Now auto-link plain URLs
  const urlRegex = /https?:\/\/\S+/g
  textWithPlaceholders = textWithPlaceholders.replace(urlRegex, (url) => {
    const cleanUrl = url.replace(/[.,;:!?]+$/, "")
    const trailingPunc = url.slice(cleanUrl.length)
    return `[${cleanUrl}](${cleanUrl})${trailingPunc}`
  })

  // Restore the original markdown links
  markdownLinks.forEach((link, index) => {
    textWithPlaceholders = textWithPlaceholders.replace(
      `${placeholder}${index}${placeholder}`,
      link,
    )
  })

  return textWithPlaceholders
}

export const Markdown = ({ markdown, className }: Props) => {
  if (!markdown) return null

  const processedMarkdown = autoLinkUrls(markdown)
    // Process newlines: convert single newlines to line breaks
    .replace(/\n(?!\n)/g, "  \n")

  return (
    <div className={clsx(proseClasses, className)}>
      <Remark
        remarkToRehypeOptions={{ allowDangerousHtml: true }}
        rehypeReactOptions={{ components }}
      >
        {processedMarkdown}
      </Remark>
    </div>
  )
}
