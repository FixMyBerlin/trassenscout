import Link from "next/link"
import clsx from "clsx"
import { TNewsItem } from "./newsItems.const"
import React from "react"

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function NewsItem({ article }: { article: TNewsItem }) {
  return (
    <Card as="article" className="">
      {/* <Card.Title href={`/articles/${article.slug}`}>{article.title}</Card.Title> */}
      <Card.Title>{article.title}</Card.Title>
      <Card.Eyebrow as="time" dateTime={article.date} decorate className="">
        {formatDate(article.date)}
      </Card.Eyebrow>
      <Card.Description>{article.body}</Card.Description>
      {/* <Card.Cta>Weiterlesen…</Card.Cta> */}
    </Card>
  )
}

function ChevronRightIcon(props: any) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6.75 5.75 9.25 8l-2.5 2.25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Card({ as: Component = "div", className, children }: any) {
  return (
    <Component className={clsx(className, "group relative flex flex-col items-start")}>
      {children}
    </Component>
  )
}

Card.Link = function CardLink({ children, ...props }: any) {
  return (
    <>
      <div className="group-hover:opacity-100/50 absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-gray-50 opacity-0 transition group-hover:scale-100 sm:-inset-x-6 sm:rounded-2xl" />
      <Link {...props} legacyBehavior>
        <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
        <span className="relative z-10">{children}</span>
      </Link>
    </>
  )
}

Card.Title = function CardTitle({ as: Component = "h2", href, children }: any) {
  return (
    <Component className="text-base font-semibold tracking-tight text-gray-800">
      {href ? <Card.Link href={href}>{children}</Card.Link> : children}
    </Component>
  )
}

Card.Description = function CardDescription({ children }: { children: React.ReactNode }) {
  return <div className="prose relative z-10 mt-2 text-sm">{children}</div>
}

Card.Cta = function CardCta({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="text-teal-500 relative z-10 mt-4 flex items-center text-sm font-medium"
    >
      {children}
      <ChevronRightIcon className="ml-1 h-4 w-4 stroke-current" />
    </div>
  )
}

Card.Eyebrow = function CardEyebrow({
  as: Component = "p",
  decorate = false,
  className,
  children,
  ...props
}: any) {
  return (
    <Component
      className={clsx(
        className,
        "relative z-10 order-first mb-3 flex items-center text-sm text-gray-400",
        decorate && "pl-3.5",
      )}
      {...props}
    >
      {decorate && (
        <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
          <span className="h-4 w-0.5 rounded-full bg-gray-200" />
        </span>
      )}
      {children}
    </Component>
  )
}
