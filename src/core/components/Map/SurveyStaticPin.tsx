import clsx from "clsx"
import * as React from "react"

type Props = {
  colorClass?: string
  light?: boolean
  small?: boolean
}

const SurveyStaticPin: React.FC<Props> = ({ colorClass, light, small }) => {
  return (
    <svg width="38" height="48" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="pin-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="38" height="48">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19 0C29.4934 0 38 8.82644 38 19.7144C38 22.3298 36.7984 25.629 34.5493 29.4168C32.8863 32.2175 30.7033 35.2017 28.1269 38.2825C25.9191 40.9225 23.5498 43.484 21.1804 45.8647L19.984 47.0508L19 48L18.016 47.0508C17.6338 46.6771 17.2342 46.2812 16.8196 45.8647C14.4502 43.484 12.0809 40.9225 9.87312 38.2825C7.2967 35.2017 5.11365 32.2175 3.4507 29.4168C1.20161 25.629 0 22.3298 0 19.7144C0 8.82644 8.50659 0 19 0Z"
            fill="white"
            transform={small ? "scale(0.7)" : undefined} // Shrink the SVG by 30%
          />
        </mask>
      </defs>
      <rect
        width="38"
        height="48"
        className={clsx(
          light && "stroke-white opacity-70",
          colorClass || "fill-[var(--survey-primary-color)]",
        )}
        mask="url(#pin-mask)"
      />
      <path
        d="M14 20.3846L17.4737 25L25 15"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={small ? "scale(0.7)" : undefined} // Shrink the SVG by 30%
      />
    </svg>
  )
}

export default React.memo(SurveyStaticPin)
