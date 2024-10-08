type Props = { children: React.ReactNode }

export const NavigationWrapper = ({ children }: Props) => {
  return (
    <nav className="z-20 bg-gray-800 shadow-xl">
      <div className="mx-auto px-2 sm:px-6 lg:px-5">{children}</div>
    </nav>
  )
}
